export interface SearchResult {
    id: string;
    title: string;
    description?: string;
    category: 'Pages' | 'Recent' | 'Actions';
    icon: string;
    route: string;
}

export interface SearchResponse {
    results: SearchResult[];
    total: number;
    query: string;
}
