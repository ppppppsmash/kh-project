import { useMemo } from "react";
import { qaDefaultCategories } from "@/config";
import type { QaFormValues } from "@/lib/validations";

export const useQaCategories = (
	qaItems: QaFormValues[] | undefined,
	options?: { includeAll?: boolean }
) => {
	return useMemo(() => {
		const dbCategories = Array.from(
			new Set(qaItems?.map((item) => item.category) ?? []),
		)
			.filter(Boolean)
			.filter((category) => !qaDefaultCategories.includes(category));

		const categories = [...qaDefaultCategories, ...dbCategories];
		return options?.includeAll ? ["全て", ...categories] : categories;
	}, [qaItems, options?.includeAll]);
};
