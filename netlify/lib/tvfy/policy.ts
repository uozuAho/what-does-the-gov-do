import fetch from 'node-fetch';

/**
 * https://theyvoteforyou.org.au/help/data#policy
 */
export interface TvfyPolicy {
  id: number;
  name: string;
  description: string;
  provisional: boolean;
  policy_divisions: TvfyPolicyDivision[]
  people_comparisons: TvfyPersonComparison[]
}

export interface TvfyPolicyDivision {
  // incomplete
  division: {};
  vote: string;
  strong: boolean;
}

export interface TvfyPersonComparison {
  person: {
    id: number;
    latest_member: {
      id: number;
      name: {
        first: string;
        last: string;
      };
      electorate: string;
      house: string;
      party: string;
    }
  };
  agreement: string;
  voted: boolean;
}

export async function policy(apikey: string, id: number): Promise<TvfyPolicy> {
  return await fetch(`https://theyvoteforyou.org.au/api/v1/policies/${id}.json?key=${apikey}`)
    .then(response => response.json()) as TvfyPolicy;
}
