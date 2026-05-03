/*
 * Copyright (c) 2026 Tom Papaioannou. All rights reserved.
 * Licensed under the MIT License
 */

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { geoGraticule10, geoNaturalEarth1, geoPath } from 'd3-geo';
import { json } from 'd3-fetch';
import { select } from 'd3-selection';
import 'd3-transition';
import { Feature, FeatureCollection, Geometry, Polygon } from 'geojson';
import { NationService } from '../../services/nation.service';
import { MappedNation, toMappedNation } from '../../utils/nation-map-utils';

interface MapRegion {
  name: string;
  geometry: { type: 'Sphere' } | Feature<Polygon>;
}

const mapRegions: MapRegion[] = [
  { name: 'World', geometry: { type: 'Sphere' } },
  { name: 'Europe', geometry: createBoundsFeature(-25, 34, 45, 72) },
  { name: 'North America', geometry: createBoundsFeature(-170, 5, -50, 84) },
  { name: 'South America', geometry: createBoundsFeature(-83, -56, -34, 13) },
  { name: 'Africa', geometry: createBoundsFeature(-20, -36, 55, 38) },
  { name: 'Asia', geometry: createBoundsFeature(25, -12, 180, 82) },
  { name: 'Oceania', geometry: createBoundsFeature(110, -48, 180, 5) },
  { name: 'Antarctica', geometry: createBoundsFeature(-180, -90, 180, -60) }
];

function createBoundsFeature(west: number, south: number, east: number, north: number): Feature<Polygon> {
  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [west, south],
        [east, south],
        [east, north],
        [west, north],
        [west, south]
      ]]
    }
  };
}

@Component({
  selector: 'app-world-map',
  imports: [CommonModule],
  templateUrl: './world-map.html',
  styleUrl: './world-map.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorldMap implements AfterViewInit, OnDestroy {
  @ViewChild('mapHost', { static: true }) private mapHost!: ElementRef<HTMLDivElement>;

  nations = signal<MappedNation[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  selectedNation = signal<MappedNation | null>(null);
  selectedRegion = signal('World');
  readonly mapRegions = mapRegions;
  private worldFeatures: Feature<Geometry>[] = [];
  private mapLoaded = false;
  private nationsLoaded = false;
  private resizeObserver?: ResizeObserver;
  private viewReady = false;

  constructor(
    private readonly nationService: NationService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.loadWorldMap();
    this.loadNations();
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => this.renderMap());
    });
    this.resizeObserver.observe(this.mapHost.nativeElement);
    this.renderMap();
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  openNation(nation: MappedNation): void {
    this.router.navigate(['/nations', nation.nationID, 'competitions']);
  }

  selectRegion(region: MapRegion): void {
    this.selectedRegion.set(region.name);
    this.renderMap();
  }

  private loadNations(): void {
    this.loading.set(true);
    this.error.set(null);

    this.nationService.getAll().subscribe({
      next: (nations) => {
        this.nations.set(nations.map(toMappedNation).filter((nation): nation is MappedNation => nation !== null));
        this.nationsLoaded = true;
        this.finishLoading();
        this.renderMap();
        this.cdr.markForCheck();
      },
      error: () => {
        this.error.set('Failed to load nations');
        this.loading.set(false);
        this.cdr.markForCheck();
      }
    });
  }

  private loadWorldMap(): void {
    this.loading.set(true);
    this.error.set(null);

    json<FeatureCollection<Geometry>>('assets/maps/world-land.json')
      .then((worldLand) => {
        this.worldFeatures = worldLand?.features ?? [];
        this.mapLoaded = true;
        this.finishLoading();
        this.renderMap();
        this.cdr.markForCheck();
      })
      .catch(() => {
        this.error.set('Failed to load world map');
        this.loading.set(false);
        this.cdr.markForCheck();
      });
  }

  private finishLoading(): void {
    if (this.mapLoaded && this.nationsLoaded) {
      this.loading.set(false);
    }
  }

  private renderMap(): void {
    if (!this.viewReady || !this.mapLoaded) {
      return;
    }

    const host = this.mapHost.nativeElement;
    const hostWidth = Math.max(host.clientWidth, 320);
    const hostHeight = Math.max(host.clientHeight, 320);
    const mapAspectRatio = 1.92;
    const height = hostHeight;
    const width = Math.min(hostWidth, Math.round(height * mapAspectRatio));

    select(host).selectAll('*').remove();

    const svg = select(host)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('role', 'img')
      .attr('aria-label', 'World map with clickable nation flags')
      .style('display', 'block')
      .style('width', `${width}px`)
      .style('max-width', '100%')
      .style('height', `${height}px`);

    const region = this.mapRegions.find(item => item.name === this.selectedRegion()) ?? this.mapRegions[0];
    const projection = geoNaturalEarth1()
      .fitExtent([[18, 18], [width - 18, height - 18]], region.geometry);
    const path = geoPath(projection);
    const graticule = geoGraticule10();

    svg.append('path')
      .datum({ type: 'Sphere' })
      .attr('d', path as any)
      .attr('fill', 'rgba(5, 20, 36, 0.72)')
      .attr('stroke', 'rgba(255,255,255,0.2)')
      .attr('stroke-width', 1.2);

    svg.append('path')
      .datum(graticule)
      .attr('d', path as any)
      .attr('fill', 'none')
      .attr('stroke', 'rgba(255,255,255,0.08)')
      .attr('stroke-width', 0.7);

    svg.append('g')
      .selectAll('path')
      .data(this.worldFeatures)
      .join('path')
      .attr('d', path as any)
      .attr('fill', 'rgba(67, 103, 71, 0.95)')
      .attr('stroke', 'rgba(255,255,255,0.16)')
      .attr('stroke-width', 0.8);

    const marker = svg.append('g')
      .selectAll('g')
      .data(this.nations())
      .join('g')
      .attr('transform', nation => {
        const point = projection([nation.longitude, nation.latitude]) ?? [0, 0];
        return `translate(${point[0]},${point[1]})`;
      })
      .style('cursor', 'pointer')
      .attr('tabindex', 0)
      .attr('role', 'button')
      .attr('aria-label', nation => `Open ${nation.name} competitions`)
      .on('click', (_, nation) => this.openNation(nation))
      .on('mouseenter', (event: MouseEvent, nation) => {
        this.selectedNation.set(nation);
        select(event.currentTarget as SVGGElement)
          .raise()
          .transition()
          .duration(140)
          .attr('transform', () => {
            const point = projection([nation.longitude, nation.latitude]) ?? [0, 0];
            return `translate(${point[0]},${point[1]}) scale(1.18)`;
          });
        this.cdr.markForCheck();
      })
      .on('mouseleave', (event: MouseEvent, nation) => {
        this.selectedNation.set(null);
        select(event.currentTarget as SVGGElement)
          .transition()
          .duration(140)
          .attr('transform', () => {
            const point = projection([nation.longitude, nation.latitude]) ?? [0, 0];
            return `translate(${point[0]},${point[1]})`;
          });
        this.cdr.markForCheck();
      })
      .on('keydown', (event, nation) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          this.openNation(nation);
        }
      });

    marker.append('circle')
      .attr('r', 15)
      .attr('fill', 'rgba(11, 31, 58, 0.96)')
      .attr('stroke', 'rgba(255,255,255,0.86)')
      .attr('stroke-width', 2);

    marker.append('image')
      .attr('href', nation => nation.flagUrl)
      .attr('x', -11)
      .attr('y', -8)
      .attr('width', 22)
      .attr('height', 16)
      .attr('preserveAspectRatio', 'xMidYMid slice');
  }
}
