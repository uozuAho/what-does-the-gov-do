import { Handler } from '@netlify/functions';
import { Tvfy, TvfyPolicy } from '../../lib/tvfy';

/**
 * Expected request params:
 * id: policy id
 */

/**
 * The response of this API
 */
interface PolicyDetails {
  title: string;
  description: string;
  partyAgreements: PartyAgreement[]
}

interface PartyAgreement {
  party: string;
  agreements: Number[];
  color: string | null;
}

export const handler: Handler = async (event, context) => {
  const { id } = event.queryStringParameters;
  const tvfy = new Tvfy();

  const policy = await tvfy.policy(Number(id));
  const agreements = extractPartyAgreements(policy);

  const policyDetails: PolicyDetails = {
    title: policy.name,
    description: policy.description,
    partyAgreements: agreements
  };

  return {
    statusCode: 200,
    body: JSON.stringify(policyDetails),
  }
}

function extractPartyAgreements(policy: TvfyPolicy): PartyAgreement[] {
  const map: Map<string, PartyAgreement> = new Map();

  policy.people_comparisons.reduce((map, pc) => {
    const party = pc.person.latest_member.party;
    if (!map.has(party)) {
      map.set(party, {
        party,
        agreements: [],
        color: null
      });
    }

    map.get(party).agreements.push(new Number(pc.agreement));

    return map;
  }, map);

  return Array.from(map.values());
}
