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
  memberDetails: MemberDetails[]
}

interface PartyAgreement {
  party: string;
  agreements: Number[];
  color: string | null;
}

interface MemberDetails {
  name: string;
  party: string;
  electorate: string;
  agreement: number;
}

export const handler: Handler = async (event, context) => {
  const { id } = event.queryStringParameters;
  const tvfy = new Tvfy();

  const policy = await tvfy.policy(Number(id));
  const partyAgreements = extractPartyAgreements(policy);
  const memberDetails: MemberDetails[] = policy.people_comparisons.map(pc => ({
    name: `${pc.person.latest_member.name.first} ${pc.person.latest_member.name.last}`,
    party: pc.person.latest_member.party,
    electorate: pc.person.latest_member.electorate,
    agreement: Number(pc.agreement)
  }));

  const policyDetails: PolicyDetails = {
    title: policy.name,
    description: policy.description,
    partyAgreements,
    memberDetails
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
