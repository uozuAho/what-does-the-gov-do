import fetch from 'node-fetch';

/**
 * https://theyvoteforyou.org.au/help/data#policies
 */
export interface TvfyPolicy {
  id: number;
  name: string;
  description: string;
  provisional: boolean;
  last_edited_at: string;
}

export async function policies(apikey: string): Promise<TvfyPolicy[]> {
  return await fetch(`https://theyvoteforyou.org.au/api/v1/policies.json?key=${apikey}`)
    .then(response => response.json()) as TvfyPolicy[];
}
