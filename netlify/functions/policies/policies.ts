import { Handler } from '@netlify/functions';
import fetch from 'node-fetch';

export const handler: Handler = async (event, context) => {
  const apiKey = process.env.TVFY_API_KEY;

  const policies = await fetch(`https://theyvoteforyou.org.au/api/v1/policies.json?key=${apiKey}`)
    .then(response => response.json());

  return {
    statusCode: 200,
    body: JSON.stringify(policies),
  }
}
