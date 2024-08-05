import { Octokit } from "@octokit/core";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const [, , userName, role, orgName] = process.argv;

if (!userName || !role || !orgName) {
  console.error('Invalid input. Please provide the userName, role, and organization name.');
  process.exit(1);
}

const token = process.env.GITHUB_TOKEN;

const octokit = new Octokit({
  auth: token,
  request: {
    fetch: fetch
  },
  baseUrl:'https://git.catchpoint.net/api/v3',
});


async function getInfoOrganisation(org) {
    try {
      const response = await octokit.request('GET /orgs/{org}/members', {
          org: org,
          headers: {
            'X-GitHub-Api-Version': '2022-11-28'
          }
        })
      return response.data;
    } catch (error) {
      console.error(`Error fetching organization info: ${error}`);
      
    }
  }
  
async function addUserToOrg(org, user, role) {
  try {
    await octokit.request('PUT /orgs/{org}/memberships/{userName}', {
      org: org,
      userName: user,
      role: role,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    console.log(`Added user ${user} successfully to ${org} as ${role}.`);
  } catch (error) {
    console.error(`Error inviting ${user} to ${org}:`, error);
  }
}

async function main() {
    const orgInfo = await getInfoOrganisation(orgName);
    try{
    let userAlreadyExists = false;
    for (const org of orgInfo) {
        if (org.login === userName) {
           console.log(`member ${userName} already exist in a organisation ${orgName}`)
           userAlreadyExists = true;
           break; 
        }
       
        
    }
    if(!userAlreadyExists){
        await addUserToOrg(orgName, userName, role);
    }
}
catch(error)
{
    console.log(error)
}
  
}

main();
