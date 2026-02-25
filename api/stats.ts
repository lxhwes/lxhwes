export const config = { runtime: 'edge' };

const GITHUB_USER = 'lxhwes';

interface GitHubUser {
  public_repos: number;
  name: string;
}

interface GitHubRepo {
  stargazers_count: number;
  pushed_at: string;
}

async function fetchGitHubStats(): Promise<{
  repos: number;
  stars: number;
  lastPush: string;
} | null> {
  try {
    const headers = { 'User-Agent': 'lxhwes-profile-stats/1.0' };

    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${GITHUB_USER}`, { headers }),
      fetch(
        `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`,
        { headers }
      ),
    ]);

    if (!userRes.ok || !reposRes.ok) return null;

    const user = (await userRes.json()) as GitHubUser;
    const repos = (await reposRes.json()) as GitHubRepo[];

    const stars = repos.reduce(
      (sum: number, r: GitHubRepo) => sum + r.stargazers_count,
      0
    );
    const lastPush =
      repos[0]?.pushed_at
        ? new Date(repos[0].pushed_at).toISOString().slice(0, 10)
        : '';

    return { repos: user.public_repos, stars, lastPush };
  } catch {
    return null;
  }
}

function buildSVG(stats: { repos: number; stars: number; lastPush: string } | null): string {
  const repos = stats?.repos ?? 0;
  const stars = stats?.stars ?? 0;

  // Wave amplitude scales with stars, clamped 20–50
  const amplitude = stats
    ? Math.min(50, Math.max(20, 20 + Math.round((stars / 50) * 30)))
    : 30;

  const statsLine = stats
    ? `${repos} repos · ${stars} stars`
    : 'github.com/lxhwes';

  // Build 3 wave paths across 800px width, y-centered at 100
  // Each wave is a sine approximation using cubic bezier curves
  // We tile the wave to fill 1600px (double width) so the scroll animation loops cleanly
  const waveY = 100;
  const period = 160; // pixels per full cycle

  function wavePath(amp: number, phase: number): string {
    // Generate one full tile (1600px) of sine wave via cubic bezier approximation
    // Control point magic number for sine via cubic bezier: 4/3 * tan(pi/4) ≈ 0.5523
    const cp = 0.5523;
    const half = period / 2;
    const quarter = period / 4;

    let d = `M ${phase} ${waveY}`;
    const tileWidth = 1600 + period;

    for (let x = phase; x < tileWidth + phase; x += period) {
      // Rising half
      d += ` C ${x + quarter * cp} ${waveY - amp}, ${x + half - quarter * cp} ${waveY - amp}, ${x + half} ${waveY}`;
      // Falling half
      d += ` C ${x + half + quarter * cp} ${waveY + amp}, ${x + period - quarter * cp} ${waveY + amp}, ${x + period} ${waveY}`;
    }
    return d;
  }

  const wave1 = wavePath(amplitude, 0);
  const wave2 = wavePath(Math.round(amplitude * 0.6), -40);
  const wave3 = wavePath(Math.round(amplitude * 0.35), -80);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 200" width="800" height="200" role="img" aria-label="Alex Howes GitHub stats">
  <defs>
    <style>
      :root { color-scheme: light dark; }
      .bg { fill: #ffffff; }
      .wave1 { stroke: #1a1a1a; opacity: 0.15; }
      .wave2 { stroke: #1a1a1a; opacity: 0.09; }
      .wave3 { stroke: #1a1a1a; opacity: 0.05; }
      .name { fill: #0d0d0d; font-family: 'SF Mono', 'Fira Code', 'Fira Mono', monospace; font-size: 38px; font-weight: 600; }
      .cursor { fill: #0d0d0d; }
      .stats { fill: #555555; font-family: 'SF Mono', 'Fira Code', 'Fira Mono', monospace; font-size: 14px; }
      .email { fill: #888888; font-family: 'SF Mono', 'Fira Code', 'Fira Mono', monospace; font-size: 14px; }
      @media (prefers-color-scheme: dark) {
        .bg { fill: #0d1117; }
        .wave1 { stroke: #ffffff; opacity: 0.12; }
        .wave2 { stroke: #ffffff; opacity: 0.07; }
        .wave3 { stroke: #ffffff; opacity: 0.04; }
        .name { fill: #e6edf3; }
        .cursor { fill: #58a6ff; }
        .stats { fill: #8b949e; }
        .email { fill: #6e7681; }
      }
    </style>
  </defs>

  <!-- Background -->
  <rect class="bg" width="800" height="200"/>

  <!-- Wave group — scrolls left by one tile (800px) over 8s -->
  <g clip-path="url(#wave-clip)">
    <defs>
      <clipPath id="wave-clip">
        <rect width="800" height="200"/>
      </clipPath>
    </defs>

    <g>
      <animateTransform attributeName="transform" type="translate" from="0,0" to="-800,0" dur="8s" repeatCount="indefinite"/>
      <path class="wave3" d="${wave3}" fill="none" stroke-width="1.5"/>
      <path class="wave2" d="${wave2}" fill="none" stroke-width="2"/>
      <path class="wave1" d="${wave1}" fill="none" stroke-width="2.5"/>
    </g>
  </g>

  <!-- Name with blinking cursor -->
  <text class="name" x="40" y="110">Alex Howes</text>
  <rect class="cursor" x="302" y="78" width="3" height="38">
    <animate attributeName="opacity" values="1;1;0;0;1" keyTimes="0;0.4;0.5;0.9;1" dur="1.1s" repeatCount="indefinite"/>
  </rect>

  <!-- Stats line -->
  <text class="stats" x="40" y="138">${statsLine}</text>

  <!-- Email -->
  <text class="email" x="40" y="160">alex@howes.dev</text>
</svg>`;
}

export default async function handler(): Promise<Response> {
  const stats = await fetchGitHubStats();
  const svg = buildSVG(stats);

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=900',
    },
  });
}
