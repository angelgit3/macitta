import { createClient } from "@/utils/supabase/client";

/**
 * Fetches student counts for a list of classroom IDs.
 * Returns a Record mapping classroom_id → student count.
 *
 * Extracted to avoid duplicate fetch+countMap logic in
 * docente/page.tsx and MisClasesClient.tsx.
 */
export async function getStudentCounts(
    classroomIds: string[],
): Promise<Record<string, number>> {
    if (classroomIds.length === 0) return {};

    const supabase = createClient();
    const { data: rows } = await supabase
        .from("classroom_students")
        .select("classroom_id")
        .in("classroom_id", classroomIds);

    const countMap: Record<string, number> = {};
    (rows ?? []).forEach((r: { classroom_id: string }) => {
        countMap[r.classroom_id] = (countMap[r.classroom_id] ?? 0) + 1;
    });
    return countMap;
}
