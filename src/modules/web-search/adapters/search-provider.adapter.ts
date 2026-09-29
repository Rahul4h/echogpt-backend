

export type SearchProviderType = 'TAVILY';
export interface SearchRequest {
  query: string;
}

export interface SearchResultItem {
  title: string;
  url: string;
  content: string;
}

export interface SearchResponse {
  query: string;
  results: SearchResultItem[];
}

export interface SearchProviderAdapter {
  search(request: SearchRequest): Promise<SearchResponse>;
}