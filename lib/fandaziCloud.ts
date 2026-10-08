import { supabase } from "@/lib/supabase";

export const FANDAZI_SHARE_CODE = "180317";

export type FandaziCloudState = {
    fridgeItems?: unknown[];
    customRecipes?: unknown[];
    weekPlan?: unknown[];
    shoppingChecks?: Record<string, boolean>;
    mealLogs?: unknown[];
    tonightDinner?: unknown | null;
};

export async function getCloudState() {
    const { data, error } = await supabase.rpc(
        "get_fandazi_household",
        {
            p_share_code: FANDAZI_SHARE_CODE,
        }
    );

    if (error) {
        console.error(
            "Failed to load Fandazi cloud state:",
            error
        );

        return null;
    }

    if (!data || data.length === 0) {
        return null;
    }

    return data[0].state as FandaziCloudState;
}

export async function saveCloudState(
    state: FandaziCloudState
) {
    const { data, error } = await supabase.rpc(
        "update_fandazi_household",
        {
            p_share_code: FANDAZI_SHARE_CODE,
            p_state: state,
        }
    );

    if (error) {
        console.error(
            "Failed to save Fandazi cloud state:",
            error
        );

        return false;
    }

    return data === true;
}

export async function patchCloudState(
    patch: Partial<FandaziCloudState>
) {
    const { data, error } = await supabase.rpc(
        "patch_fandazi_household",
        {
            p_share_code: FANDAZI_SHARE_CODE,
            p_patch: patch,
        }
    );

    if (error) {
        console.error(
            "Failed to patch Fandazi cloud state:",
            error
        );

        return null;
    }

    return data as FandaziCloudState;
}