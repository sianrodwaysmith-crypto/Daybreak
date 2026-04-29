/**
 * Competitive landscape content. Original prose summarising where the
 * lines between players blur, plus a hairline diagram of the major
 * investment + cloud-host partnerships among the five profiled
 * companies and OpenAI.
 */

export const LANDSCAPE = {
  intro:
`The single fact that organises the AI market in 2025 is that no one player owns the full stack alone. Each major company has had to pick partners up or down the layers — and most have picked more than one, which means the same firm is often a partner, a customer, and a competitor on different surfaces.

The four big partnerships are the ones to keep in mind. Microsoft has invested over $13bn in OpenAI; Azure is OpenAI's primary cloud. Amazon has invested around $8bn in Anthropic; Claude runs on Bedrock and trains on AWS Trainium. Google has a separate stake in Anthropic and a separate cloud relationship via GCP and Vertex. Salesforce's partnership with Anthropic puts Claude inside Agentforce as one of the underlying models. Each pairs a hyperscaler or application platform with an AI lab, in a shape similar enough that the strategic logic is clearly the same.

Where the lines blur most is between Microsoft and OpenAI, who increasingly compete on agent and product surfaces; between Microsoft and Salesforce in CRM and productivity; and between Google's Gemini and the partner labs (Anthropic, OpenAI) it also competes with. The application platforms — Salesforce, ServiceNow, Microsoft 365 — have become the front door buyers actually walk through, while the hyperscalers and AI labs negotiate underneath about who powers what.`,

  diagramSvg:
`<svg viewBox="0 0 600 300" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round" font-family="-apple-system,'SF Pro Display','Helvetica Neue',sans-serif">
  <g stroke-width="1">
    <rect x="20"  y="40"  width="120" height="32" rx="4" />
    <rect x="20"  y="100" width="120" height="32" rx="4" />
    <rect x="20"  y="160" width="120" height="32" rx="4" />
    <rect x="20"  y="220" width="120" height="32" rx="4" />
    <rect x="460" y="40"  width="120" height="32" rx="4" />
    <rect x="460" y="130" width="120" height="32" rx="4" />
  </g>
  <g font-size="10" fill="currentColor" stroke="none" text-anchor="middle">
    <text x="80"  y="60">Microsoft</text>
    <text x="80"  y="120">Amazon</text>
    <text x="80"  y="180">Google</text>
    <text x="80"  y="240">Salesforce</text>
    <text x="520" y="60">OpenAI</text>
    <text x="520" y="150">Anthropic</text>
  </g>
  <g stroke-width="0.75" opacity="0.85">
    <line x1="140" y1="56" x2="460" y2="56" />
    <polyline points="456,53 460,56 456,59" fill="currentColor" stroke="none" />
    <line x1="140" y1="116" x2="460" y2="146" />
    <polyline points="455,144 460,146 456,150" fill="currentColor" stroke="none" />
    <line x1="140" y1="176" x2="460" y2="148" />
    <polyline points="455,144 460,146 457,151" fill="currentColor" stroke="none" />
    <line x1="140" y1="236" x2="460" y2="150" />
    <polyline points="456,147 460,150 456,153" fill="currentColor" stroke="none" />
  </g>
  <g font-size="9" fill="currentColor" stroke="none" font-style="italic">
    <text x="300" y="50" text-anchor="middle">$13bn+, Azure as primary cloud</text>
    <text x="300" y="115" text-anchor="middle">$8bn, Bedrock + Trainium</text>
    <text x="300" y="170" text-anchor="middle">stake + GCP / Vertex partnership</text>
    <text x="300" y="220" text-anchor="middle">Agentforce partnership</text>
  </g>
  <g stroke="currentColor" stroke-width="0.6" stroke-dasharray="3 3" opacity="0.45">
    <path d="M 520 76 C 580 110, 580 100, 520 132" />
  </g>
  <g font-size="9" fill="currentColor" stroke="none" font-style="italic" opacity="0.7">
    <text x="586" y="106" text-anchor="end">competes</text>
  </g>
  <text x="300" y="288" font-size="10" fill="currentColor" stroke="none" font-style="italic" text-anchor="middle">Solid arrows: investment / cloud partnership. Dashed: direct competition.</text>
</svg>`,
}
