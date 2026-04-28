/**
 * Architecture overview content. Original prose summarising publicly
 * known structure of the modern AI / cloud stack.
 */

export const ARCHITECTURE = {
  intro:
`The modern AI and cloud stack has settled into roughly five layers. At the bottom is silicon — the GPUs and custom chips that do the compute. Above that, the hyperscalers (AWS, Azure, GCP) own the data centres, the networking, and the operational ladder. Above the hyperscalers, AI labs train and serve foundation models. On top of all of it sit the application platforms that businesses actually buy from. And at the very top are the people and automated agents using the stack.

Each layer commercialises differently. Silicon vendors sell chips. Hyperscalers rent compute and storage by the hour and increasingly host other people's models. AI labs sell access to their foundation models — sometimes directly via API, sometimes through cloud partners. Application platforms wrap models into product surfaces a buyer recognises: CRM, productivity suites, support tools.

The interesting tension is that the lines blur. Microsoft is a hyperscaler that also owns much of OpenAI's commercial future. Anthropic is an AI lab that runs primarily on AWS and is partly owned by Amazon. Google sits at every layer at once. Watching where each company is integrating up or down is most of the strategic story.`,

  diagramSvg:
`<svg viewBox="0 0 600 280" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round" font-family="-apple-system,'SF Pro Display','Helvetica Neue',sans-serif">
  <g stroke-width="1">
    <rect x="30" y="20"  width="540" height="44" rx="4" />
    <rect x="30" y="72"  width="540" height="44" rx="4" />
    <rect x="30" y="124" width="540" height="44" rx="4" />
    <rect x="30" y="176" width="540" height="44" rx="4" />
    <rect x="30" y="228" width="540" height="44" rx="4" />
  </g>
  <g font-size="11" fill="currentColor" stroke="none">
    <text x="48" y="38" font-weight="500">Users and agents</text>
    <text x="48" y="54" font-size="10" opacity="0.65">browsers, mobile apps, desktop, automated workflows</text>

    <text x="48" y="90" font-weight="500">Application platforms</text>
    <text x="48" y="106" font-size="10" opacity="0.65">Salesforce, Microsoft 365, Workday, ServiceNow, etc.</text>

    <text x="48" y="142" font-weight="500">AI labs and foundation models</text>
    <text x="48" y="158" font-size="10" opacity="0.65">Anthropic, OpenAI, Google DeepMind, Meta, Mistral, xAI</text>

    <text x="48" y="194" font-weight="500">Hyperscalers (cloud)</text>
    <text x="48" y="210" font-size="10" opacity="0.65">AWS, Microsoft Azure, Google Cloud, plus Oracle, IBM</text>

    <text x="48" y="246" font-weight="500">Silicon</text>
    <text x="48" y="262" font-size="10" opacity="0.65">Nvidia, AMD, plus custom: AWS Trainium / Google TPU / etc.</text>
  </g>
</svg>`,
}
