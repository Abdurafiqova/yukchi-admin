<template>
  <svg
    class="h-auto w-full"
    viewBox="0 0 640 260"
    role="img"
    :aria-label="t('reports.chartTitle')"
  >
    <g stroke="#eceff4" stroke-width="1">
      <line x1="48" y1="30" x2="620" y2="30" />
      <line x1="48" y1="75" x2="620" y2="75" />
      <line x1="48" y1="120" x2="620" y2="120" />
      <line x1="48" y1="165" x2="620" y2="165" />
      <line x1="48" y1="210" x2="620" y2="210" />
    </g>

    <g fill="#7a8899" font-size="10.5" font-weight="600" text-anchor="end">
      <text x="38" y="214">0</text>
      <text x="38" y="169">100</text>
      <text x="38" y="124">200</text>
      <text x="38" y="79">300</text>
      <text x="38" y="34">400</text>
    </g>

    <rect fill="#1a365d" x="52" y="84" width="44" height="126" rx="5" />
    <rect fill="#1a365d" x="130" y="66" width="44" height="144" rx="5" />
    <rect fill="#1a365d" x="208" y="73" width="44" height="137" rx="5" />
    <rect fill="#1a365d" x="286" y="47" width="44" height="163" rx="5" />
    <rect fill="#1a365d" x="364" y="57" width="44" height="153" rx="5" />
    <rect fill="#1a365d" x="442" y="77" width="44" height="133" rx="5" />
    <rect fill="#f97316" x="520" y="56" width="44" height="154" rx="5" />

    <text fill="#1a365d" font-size="11" font-weight="800" text-anchor="middle" x="542" y="46">342</text>

    <g fill="#7a8899" font-size="10.5" font-weight="600" text-anchor="middle">
      <text x="74" y="232">{{ t('reports.weekdayMon') }}</text>
      <text x="152" y="232">{{ t('reports.weekdayTue') }}</text>
      <text x="230" y="232">{{ t('reports.weekdayWed') }}</text>
      <text x="308" y="232">{{ t('reports.weekdayThu') }}</text>
      <text x="386" y="232">{{ t('reports.weekdayFri') }}</text>
      <text x="464" y="232">{{ t('reports.weekdaySat') }}</text>
      <text x="542" y="232">{{ t('reports.weekdaySun') }}</text>
    </g>
  </svg>
</template>

<script setup lang="ts">
const { t } = useI18n();
</script>
