import { useQuery, useMutation } from "@tanstack/react-query";


export function useGenerate() {
    const generateMutation = useMutation({
        mutationFn: async (input: { topic: string; length: number }) => {
            const response = await fetch("/api/generate/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(input),
            });
            if (!response.ok) {
                throw new Error("Failed to generate content");
            }
            return response.json();
        }
    });

    return {
        generate: generateMutation.mutateAsync,
        isGenerating: generateMutation.isPending,
    };
}
