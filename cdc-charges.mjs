// Store the terms with each issued proposal; later releases must not rewrite them.
export const CURRENT_LATE_CHARGES = Object.freeze({version: 'multa-unica-2-v1', multaPercentual: 2, jurosMoraMensal: 0});
export const LEGACY_LATE_CHARGES = Object.freeze({version: 'legado-diario-1'});
export function lateChargeClause(s) {
  const terms = s.encargosAtraso || (s.aceite || s.linkAssinatura ? LEGACY_LATE_CHARGES : CURRENT_LATE_CHARGES);
  if (terms.version === CURRENT_LATE_CHARGES.version) return 'Em caso de atraso, incidirá multa moratória de 2% sobre o valor da parcela vencida e não paga, cobrada uma única vez por parcela. Não serão cobrados juros de mora nem multa diária.';
  return 'Em caso de atraso, incidirá multa moratória de R$ 1.00 por dia, sem prejuízo dos demais encargos contratuais aplicáveis.';
}
