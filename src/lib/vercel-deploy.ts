import crypto from 'crypto'

type DeployResult = {
  projectId: string
  deploymentUrl: string
  customDomain: string
}

export async function deployToVercel(
  htmlContent: string,
  projectName: string
): Promise<DeployResult> {
  const token = process.env.VERCEL_TOKEN!
  const teamId = process.env.VERCEL_TEAM_ID || undefined
  const mentorDomain = process.env.MENTOR_DOMAIN!

  const sha = crypto.createHash('sha1').update(htmlContent).digest('hex')
  const size = Buffer.byteLength(htmlContent, 'utf8')

  const fileHeaders: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/octet-stream',
    'x-vercel-digest': sha,
    'Content-Length': size.toString(),
  }
  if (teamId) fileHeaders['x-vercel-team-id'] = teamId

  await fetch('https://api.vercel.com/v2/files', {
    method: 'POST',
    headers: fileHeaders,
    body: htmlContent,
  })

  const teamQuery = teamId ? `?teamId=${teamId}` : ''

  const deployRes = await fetch(`https://api.vercel.com/v13/deployments${teamQuery}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: projectName,
      files: [{ file: 'index.html', sha, size }],
      target: 'production',
      projectSettings: { framework: null, outputDirectory: '.' },
    }),
  })

  if (!deployRes.ok) {
    const err = await deployRes.json()
    throw new Error(`Vercel deploy error: ${JSON.stringify(err)}`)
  }

  const deploy = await deployRes.json()
  const projectId: string = deploy.projectId

  const customDomain = `${projectName}.${mentorDomain}`
  const domainRes = await fetch(
    `https://api.vercel.com/v10/projects/${projectId}/domains${teamQuery}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: customDomain }),
    }
  )

  if (!domainRes.ok && domainRes.status !== 409) {
    console.warn('Aviso: domínio customizado não configurado', await domainRes.json())
  }

  return {
    projectId,
    deploymentUrl: `https://${deploy.url}`,
    customDomain: `https://${customDomain}`,
  }
}

export async function deleteVercelProject(projectId: string): Promise<void> {
  const token = process.env.VERCEL_TOKEN!
  const teamId = process.env.VERCEL_TEAM_ID

  const url = teamId
    ? `https://api.vercel.com/v9/projects/${projectId}?teamId=${teamId}`
    : `https://api.vercel.com/v9/projects/${projectId}`

  await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
}
