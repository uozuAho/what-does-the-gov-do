import { Handler } from '@netlify/functions';
import { Tvfy } from '../../lib/tvfy';
import {
  TvfyPersonComparison,
  TvfyPolicyDetails }
from '../../lib/tvfy/policy';

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
  colour: string | null;
  electorate: string;
  agreement: number;
}

export const handler: Handler = async (event, context) => {
  const { id } = event.queryStringParameters;
  const tvfy = new Tvfy();

  const policy = await tvfy.policy(Number(id));
  const partyAgreements = extractPartyAgreements(policy);
  const memberDetails = policy.people_comparisons.map(pc => toMemberDetails(pc));

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

function extractPartyAgreements(policy: TvfyPolicyDetails): PartyAgreement[] {
  const map: Map<string, PartyAgreement> = new Map();

  policy.people_comparisons.reduce((map, pc) => {
    const party = pc.person.latest_member.party;
    if (!map.has(party)) {
      map.set(party, {
        party,
        agreements: [],
        color: partyColour(party)
      });
    }

    map.get(party).agreements.push(new Number(pc.agreement));

    return map;
  }, map);

  // The sort puts known parties at the bottom - this has the effect of the
  // bars for known parties appearing at the the bottom of each 'stack'
  // in the histogram, which looks nicer IMO.
  return Array.from(map.values()).sort((a, b) => {
    return isKnownParty(a.party) ? -1 : isKnownParty(b.party) ? 1 : 0});
}

const PARTY_COLOURS = {
  "National Party": "aqua",
  "Liberal Party": "blue",
  "Australian Labor Party": "red",
  "Australian Greens": "green",
};

function isKnownParty(party: string) {
  return Object.getOwnPropertyNames(PARTY_COLOURS).includes(party)
}

function partyColour(party: string): string | null {
  return PARTY_COLOURS[party] ?? null;
}

function toMemberDetails(pc: TvfyPersonComparison): MemberDetails {
  return {
    name: `${pc.person.latest_member.name.first} ${pc.person.latest_member.name.last}`,
    party: pc.person.latest_member.party,
    colour: partyColour(pc.person.latest_member.party),
    electorate: pc.person.latest_member.electorate,
    agreement: Number(pc.agreement)
  };
}
