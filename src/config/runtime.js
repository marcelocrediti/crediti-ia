export const API_URL = "https://crediti-ia-api.onrender.com";
export const AI_REQUEST_TIMEOUT_MS = 60000;
export const SUPABASE_URL = "https://vgdtywdpywezrwlrsawq.supabase.co/rest/v1";
export const SUPABASE_KEY = "sb_publishable_dmoTPKmglghAohv0MrRA9A_2zlUYhER";
export const RENDA_EXTRA_URL = "https://crediti.startcapital.app/signIn";

export const LOCAL_KEYS = {
  bills: "crediti_local_bills_v1",
  favorites: "crediti_local_favorites_v1",
  recent: "crediti_local_recent_v1",
  comparisons: "crediti_local_comparisons_v1",
  profile: "crediti_financial_profile_v1",
  simulations: "crediti_simulations_v1",
  serviceRequests: "crediti_service_requests_v1",
  scorePlans: "crediti_score_plans_v1"
};

export const SCORE_PLAN_VALIDITY_MS = 90 * 24 * 60 * 60 * 1000;

export function warmAiServer() {
  fetch(`${API_URL}/health`, {
    method: "GET",
    cache: "no-store"
  }).catch(() => {
    // A Home e o restante do app continuam disponíveis mesmo se a IA estiver indisponível.
  });
}
