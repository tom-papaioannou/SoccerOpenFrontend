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
import { GeoProjection, geoGraticule10, geoNaturalEarth1, geoPath } from 'd3-geo';
import { json } from 'd3-fetch';
import { select } from 'd3-selection';
import 'd3-transition';
import { Feature, FeatureCollection, Geometry, Polygon } from 'geojson';
import { Competition, CompetitionTeamsType, CompetitionType } from '../../models/competition.model';
import { IContinent } from '../../models/continent.model';
import { ContinentService } from '../../services/continent.service';
import { CompetitionService } from '../../services/competition.service';
import { NationService } from '../../services/nation.service';
import { MappedNation, toMappedNation } from '../../utils/nation-map-utils';

interface MapRegion {
  name: string;
  geometry: { type: 'Sphere' } | Feature<Polygon>;
  bounds?: RegionBounds;
}

interface RegionBounds {
  west: number;
  south: number;
  east: number;
  north: number;
}

interface RegionViewTransform {
  transform: string;
  scale: number;
}

const mapRegions: MapRegion[] = [
  { name: 'World', geometry: { type: 'Sphere' } },
  createMapRegion('Europe', -25, 34, 45, 72),
  createMapRegion('North America', -170, 5, -50, 84),
  createMapRegion('South America', -83, -56, -34, 13),
  createMapRegion('Africa', -20, -36, 55, 38),
  createMapRegion('Asia', 25, -12, 180, 82),
  createMapRegion('Oceania', 110, -48, 180, 5)
];

function createMapRegion(
  name: string,
  west: number,
  south: number,
  east: number,
  north: number
): MapRegion {
  return {
    name,
    geometry: createBoundsFeature(west, south, east, north),
    bounds: { west, south, east, north }
  };
}

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
  competitionError = signal<string | null>(null);
  competitions = signal<Competition[]>([]);
  competitionsLoading = signal(false);
  myCompetitions = signal<Competition[]>([]);
  myCompetitionsLoading = signal(false);
  selectedNation = signal<MappedNation | null>(null);
  selectedRegion = signal('World');
  readonly mapRegions = mapRegions;
  private continents: IContinent[] = [];
  private worldFeatures: Feature<Geometry>[] = [];
  private mapLoaded = false;
  private nationsLoaded = false;
  private continentsLoaded = false;
  private resizeObserver?: ResizeObserver;
  private viewReady = false;
  private renderedRegion = 'World';
  private animateRegionChange = false;
  private transitionInProgress = false;

  constructor(
    private readonly continentService: ContinentService,
    private readonly competitionService: CompetitionService,
    private readonly nationService: NationService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.loadWorldMap();
    this.loadContinents();
    this.loadNations();
    this.loadCompetitionsForRegion(this.mapRegions[0]);
    this.loadMyCompetitions();
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        if (!this.transitionInProgress) {
          this.renderMap();
        }
      });
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
    if (this.viewReady) {
      select(this.mapHost.nativeElement).selectAll('*').interrupt();
    }
    this.transitionInProgress = false;
    this.selectedRegion.set(region.name);
    this.selectedNation.set(null);
    this.animateRegionChange = true;
    this.loadCompetitionsForRegion(region);
    this.renderMap();
  }

  selectWorld(): void {
    this.selectRegion(this.mapRegions[0]);
  }

  openCompetition(competition: Competition): void {
    if (competition.competitionID) {
      this.router.navigate(['/competition', competition.competitionID]);
    }
  }

  clubCompetitions(): Competition[] {
    return this.getSortedCompetitions(CompetitionTeamsType.Clubs);
  }

  nationalCompetitions(): Competition[] {
    return this.getSortedCompetitions(CompetitionTeamsType.NationalTeams);
  }

  sortedMyCompetitions(): Competition[] {
    return this.sortCompetitions(this.myCompetitions());
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

  private loadContinents(): void {
    this.loading.set(true);
    this.error.set(null);

    this.continentService.loadAll().subscribe({
      next: (continents) => {
        this.continents = continents;
        this.continentsLoaded = true;
        this.finishLoading();
        this.renderMap();
        this.cdr.markForCheck();
      },
      error: () => {
        this.error.set('Failed to load continents');
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

  private loadCompetitionsForRegion(region: MapRegion): void {
    this.competitionsLoading.set(true);
    this.competitionError.set(null);

    const continentID = this.getContinentIdForRegion(region);

    if (region.name !== 'World' && !continentID) {
      this.competitions.set([]);
      this.competitionsLoading.set(false);
      this.competitionError.set('Failed to resolve continent competitions');
      this.cdr.markForCheck();
      return;
    }

    const request = region.name === 'World'
      ? this.competitionService.getWorldCompetitions()
      : this.competitionService.getByContinent(continentID!);

    request.subscribe({
      next: (competitions) => {
        this.competitions.set(competitions);
        this.competitionsLoading.set(false);
        this.cdr.markForCheck();
      },
      error: () => {
        this.competitions.set([]);
        this.competitionsLoading.set(false);
        this.competitionError.set(null);
        this.cdr.markForCheck();
      }
    });
  }

  private loadMyCompetitions(): void {
    this.myCompetitionsLoading.set(true);

    this.competitionService.getMyCompetitions().subscribe({
      next: (teamCompetitions) => {
        this.myCompetitions.set(teamCompetitions?.competitions ?? []);
        this.myCompetitionsLoading.set(false);
        this.cdr.markForCheck();
      },
      error: () => {
        this.myCompetitions.set([]);
        this.myCompetitionsLoading.set(false);
        this.cdr.markForCheck();
      }
    });
  }

  private finishLoading(): void {
    if (this.mapLoaded && this.nationsLoaded && this.continentsLoaded) {
      this.loading.set(false);
    }
  }

  private renderMap(): void {
    if (!this.viewReady || !this.mapLoaded) {
      return;
    }

    if (this.transitionInProgress) {
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
      .attr('aria-label', 'World map with clickable competition regions')
      .style('display', 'block')
      .style('width', `${width}px`)
      .style('max-width', '100%')
      .style('height', `${height}px`);

    const region = this.mapRegions.find(item => item.name === this.selectedRegion()) ?? this.mapRegions[0];
    const previousRegion = this.mapRegions.find(item => item.name === this.renderedRegion) ?? this.mapRegions[0];
    const projection = geoNaturalEarth1()
      .fitExtent([[18, 18], [width - 18, height - 18]], { type: 'Sphere' });
    const path = geoPath(projection);
    const targetTransform = this.getRegionTransform(region, width, height, projection);
    const startingTransform = this.getRegionTransform(previousRegion, width, height, projection);
    const shouldAnimate = this.animateRegionChange && previousRegion.name !== region.name;
    this.animateRegionChange = false;
    this.renderedRegion = region.name;
    this.transitionInProgress = shouldAnimate;
    const graticule = geoGraticule10();
    const mapContent = svg.append('g')
      .attr('transform', shouldAnimate ? startingTransform.transform : targetTransform.transform);

    mapContent.append('path')
      .datum({ type: 'Sphere' })
      .attr('d', path as any)
      .attr('fill', 'rgba(5, 20, 36, 0.72)')
      .attr('stroke', 'rgba(255,255,255,0.2)')
      .attr('stroke-width', 1.2);

    mapContent.append('path')
      .datum(graticule)
      .attr('d', path as any)
      .attr('fill', 'none')
      .attr('stroke', 'rgba(255,255,255,0.08)')
      .attr('stroke-width', 0.7);

    mapContent.append('g')
      .selectAll('path')
      .data(this.worldFeatures)
      .join('path')
      .attr('d', path as any)
      .attr('fill', 'rgba(67, 103, 71, 0.95)')
      .attr('stroke', 'rgba(255,255,255,0.16)')
      .attr('stroke-width', 0.8);

    if (region.name === 'World') {
      this.renderContinentButtons(mapContent, projection);
    } else {
      this.renderNationButtons(mapContent, projection, region, targetTransform, startingTransform, shouldAnimate);
    }

    if (shouldAnimate) {
      mapContent.transition()
        .duration(680)
        .attr('transform', targetTransform.transform)
        .on('end interrupt', () => {
          this.transitionInProgress = false;
        });
    }
  }

  private renderContinentButtons(mapContent: any, projection: GeoProjection): void {
    const continentRegions = this.mapRegions.filter(region => region.name !== 'World' && region.bounds);

    const marker = mapContent.append('g')
      .selectAll('g')
      .data(continentRegions)
      .join('g')
      .attr('transform', (region: MapRegion) => {
        const point = this.projectRegionCenter(region, projection);
        return `translate(${point[0]},${point[1]})`;
      })
      .style('cursor', 'pointer')
      .attr('tabindex', 0)
      .attr('role', 'button')
      .attr('aria-label', (region: MapRegion) => `Open ${region.name}`)
      .on('click', (_: MouseEvent, region: MapRegion) => this.selectRegion(region))
      .on('mouseenter', (event: MouseEvent) => {
        select(event.currentTarget as SVGGElement).select<SVGGElement>('.continent-button-visual')
          .transition()
          .duration(140)
          .attr('transform', 'scale(1.08)');
      })
      .on('mouseleave', (event: MouseEvent) => {
        select(event.currentTarget as SVGGElement).select<SVGGElement>('.continent-button-visual')
          .transition()
          .duration(140)
          .attr('transform', 'scale(1)');
      })
      .on('keydown', (event: KeyboardEvent, region: MapRegion) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          this.selectRegion(region);
        }
      });

    const visual = marker.append('g')
      .attr('class', 'continent-button-visual');

    visual.append('rect')
      .attr('x', (region: MapRegion) => -this.getRegionButtonWidth(region.name) / 2)
      .attr('y', -18)
      .attr('width', (region: MapRegion) => this.getRegionButtonWidth(region.name))
      .attr('height', 36)
      .attr('rx', 6)
      .attr('fill', 'rgba(11, 31, 58, 0.92)')
      .attr('stroke', 'rgba(255,255,255,0.78)')
      .attr('stroke-width', 1.4);

    visual.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', 'white')
      .attr('font-size', 13)
      .attr('font-weight', 700)
      .attr('pointer-events', 'none')
      .text((region: MapRegion) => region.name);
  }

  private renderNationButtons(
    mapContent: any,
    projection: GeoProjection,
    region: MapRegion,
    targetTransform: RegionViewTransform,
    startingTransform: RegionViewTransform,
    shouldAnimate: boolean
  ): void {
    const marker = mapContent.append('g')
      .selectAll('g')
      .data(this.getNationsForRegion(region))
      .join('g')
      .attr('transform', (nation: MappedNation) => {
        const point = projection([nation.longitude, nation.latitude]) ?? [0, 0];
        return `translate(${point[0]},${point[1]})`;
      })
      .style('cursor', 'pointer')
      .attr('tabindex', 0)
      .attr('role', 'button')
      .attr('aria-label', (nation: MappedNation) => `Open ${nation.name} competitions`)
      .on('click', (_: MouseEvent, nation: MappedNation) => this.openNation(nation))
      .on('mouseenter', (event: MouseEvent, nation: MappedNation) => {
        this.selectedNation.set(nation);
        select(event.currentTarget as SVGGElement).select<SVGGElement>('.marker-visual')
          .raise()
          .transition()
          .duration(140)
          .attr('transform', `scale(${1.18 / targetTransform.scale})`);
        this.cdr.markForCheck();
      })
      .on('mouseleave', (event: MouseEvent, nation: MappedNation) => {
        this.selectedNation.set(null);
        select(event.currentTarget as SVGGElement).select<SVGGElement>('.marker-visual')
          .transition()
          .duration(140)
          .attr('transform', `scale(${1 / targetTransform.scale})`);
        this.cdr.markForCheck();
      })
      .on('keydown', (event: KeyboardEvent, nation: MappedNation) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          this.openNation(nation);
        }
      });

    const markerVisual = marker.append('g')
      .attr('class', 'marker-visual')
      .attr('transform', `scale(${1 / (shouldAnimate ? startingTransform.scale : targetTransform.scale)})`);

    markerVisual.append('circle')
      .attr('r', 15)
      .attr('fill', 'rgba(11, 31, 58, 0.96)')
      .attr('stroke', 'rgba(255,255,255,0.86)')
      .attr('stroke-width', 2);

    markerVisual.append('image')
      .attr('href', (nation: MappedNation) => nation.flagUrl)
      .attr('x', -11)
      .attr('y', -8)
      .attr('width', 22)
      .attr('height', 16)
      .attr('preserveAspectRatio', 'xMidYMid slice');

    if (shouldAnimate) {
      markerVisual.transition()
        .duration(680)
        .attr('transform', `scale(${1 / targetTransform.scale})`);
    }
  }

  private getRegionTransform(
    region: MapRegion,
    width: number,
    height: number,
    projection: GeoProjection
  ): RegionViewTransform {
    if (region.name === 'World' || !region.bounds) {
      return { transform: 'translate(0,0) scale(1)', scale: 1 };
    }

    const { west, south, east, north } = region.bounds;
    const boundsPoints = [
      projection([west, south]),
      projection([west, north]),
      projection([east, south]),
      projection([east, north]),
      projection([(west + east) / 2, south]),
      projection([(west + east) / 2, north]),
      projection([west, (south + north) / 2]),
      projection([east, (south + north) / 2])
    ].filter((point): point is [number, number] => point !== null);

    if (boundsPoints.length === 0) {
      return { transform: 'translate(0,0) scale(1)', scale: 1 };
    }

    const xValues = boundsPoints.map(point => point[0]);
    const yValues = boundsPoints.map(point => point[1]);
    const x0 = Math.min(...xValues);
    const x1 = Math.max(...xValues);
    const y0 = Math.min(...yValues);
    const y1 = Math.max(...yValues);
    const dx = x1 - x0;
    const dy = y1 - y0;
    const scale = Math.min(7, 0.82 / Math.max(dx / width, dy / height));
    const translateX = width / 2 - scale * (x0 + x1) / 2;
    const translateY = height / 2 - scale * (y0 + y1) / 2;

    return {
      transform: `translate(${translateX},${translateY}) scale(${scale})`,
      scale
    };
  }

  private getNationsForRegion(region: MapRegion): MappedNation[] {
    if (region.name === 'World') {
      return [];
    }

    const continentID = this.getContinentIdForRegion(region);

    if (!continentID) {
      return [];
    }

    return this.nations().filter(nation => nation.continentID === continentID);
  }

  private projectRegionCenter(region: MapRegion, projection: GeoProjection): [number, number] {
    if (!region.bounds) {
      return [0, 0];
    }

    const { west, south, east, north } = region.bounds;
    return projection([(west + east) / 2, (south + north) / 2]) ?? [0, 0];
  }

  private getRegionButtonWidth(name: string): number {
    return Math.max(86, name.length * 8 + 28);
  }

  private getContinentIdForRegion(region: MapRegion): string | null {
    return this.continents.find(
      item => item.name.toLowerCase() === region.name.toLowerCase()
    )?.continentID ?? null;
  }

  private getSortedCompetitions(teamsType: CompetitionTeamsType): Competition[] {
    return this.sortCompetitions(
      this.competitions().filter(competition => competition.competitionTeamsType === teamsType)
    );
  }

  private sortCompetitions(competitions: Competition[]): Competition[] {
    return [...competitions].sort((a, b) => {
      const typeComparison = this.getCompetitionTypeOrder(a) - this.getCompetitionTypeOrder(b);

      if (typeComparison !== 0) {
        return typeComparison;
      }

      return (a.priority ?? 999) - (b.priority ?? 999);
    });
  }

  private getCompetitionTypeOrder(competition: Competition): number {
    if (competition.competitionType === CompetitionType.League) {
      return 0;
    }

    if (
      competition.competitionType === CompetitionType.Knockout ||
      competition.competitionType === CompetitionType.Mixed
    ) {
      return 1;
    }

    return 2;
  }
}
