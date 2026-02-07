/**
 * Basic types for Car2DB API v3
 */

// Pagination types (Hydra format)
export interface PaginatedResponse<T> {
    '@context'?: string;
    '@id'?: string;
    '@type'?: string;
    'hydra:member': T[];
    'hydra:totalItems': number;
    'hydra:view'?: {
      '@id': string;
      '@type': string;
      'hydra:first'?: string;
      'hydra:last'?: string;
      'hydra:previous'?: string;
      'hydra:next'?: string;
    };
  }

// Make
export interface Make {
    id: number;
    name: string;
    slug: string;
    cyrillic?: string;
  }

// Model
export interface Model {
    id: number;
    name: string;
    slug: string;
    make: Make;
  }

// Generation
export interface Generation {
    id: number;
    name: string;
    slug: string;
    model: Model;
    yearStart: number;
    yearStop: number | null;
  }

// Series
export interface Series {
    id: number;
    name: string;
    slug: string;
    generation: Generation;
    model: Model;
  }

// Trim
export interface Trim {
    id: number;
    name: string;
    slug: string;
    series: Series;
    model: Model;
    yearStart: number;
    yearStop: number | null;
  }

// Specification Value
export interface SpecificationValue {
    value: string | number | null;
    unit?: string;
  }

// Specification
export interface Specification {
    id: number;
    name: string;
    slug: string;
    value: SpecificationValue;
  }

// Specification Group
export interface SpecificationGroup {
    name: string;
    specifications: Specification[];
  }

// Equipment
export interface Equipment {
    id: number;
    name: string;
    slug: string;
    yearStart: number;
    yearStop: number | null;
  }

// Option Value
export interface OptionValue {
    value: string | number | null;
    unit?: string;
  }

// Option
export interface Option {
    id: number;
    name: string;
    slug: string;
    value?: OptionValue;
  }

// Option Group
export interface OptionGroup {
    name: string;
    options: Option[];
  }

// Breadcrumb
export interface Breadcrumb {
    id: number;
    name: string;
    slug: string;
    type: 'make' | 'model' | 'generation' | 'series' | 'trim' | 'equipment';
  }

// Key Specification (brief information about key characteristics)
export interface KeySpecification {
    engine?: string;
    power?: string;
    transmission?: string;
    drive?: string;
    fuel?: string;
    bodyType?: string;
  }

// Trim Full (complete information about trim)
export interface TrimFull {
    id: number;
    name: string;
    slug: string;
    yearStart: number;
    yearStop: number | null;
    breadcrumbs: Breadcrumb[];
    keySpecifications: KeySpecification;
    specifications: SpecificationGroup[];
    equipments: Equipment[];
  }

// Equipment Full (complete information about equipment)
export interface EquipmentFull {
    id: number;
    name: string;
    slug: string;
    yearStart: number;
    yearStop: number | null;
    breadcrumbs: Breadcrumb[];
    options: OptionGroup[];
  }

// Vehicle Search Result
export interface VehicleSearchResult {
    model: Model;
    trims: Trim[];
    relevance?: number;
  }

// Years response (all makes and models for a specific year)
export interface YearVehicles {
    year: number;
    makes: Array<{
      make: Make;
      models: Model[];
    }>;
  }

// API Error
export interface ApiError {
  error: string;
  status: number;
  hint?: string;
  details?: string;
}
