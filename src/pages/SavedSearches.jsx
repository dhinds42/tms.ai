import React from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useScopedEntity } from "@/components/shared/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/design-system/PageHeader";
import { Search, Star, Trash2, Play } from "lucide-react";

export default function SavedSearches() {
  const queryClient = useQueryClient();

  const { data: searches = [], isLoading } = useScopedEntity('SavedSearch', { limit: 50 });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SavedSearch.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedSearches'] });
    },
  });

  const pinnedSearches = searches.filter(s => s.is_pinned);
  const regularSearches = searches.filter(s => !s.is_pinned);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <PageHeader
        title="Saved Searches"
        subtitle="Quick access to your most-used filters"
        icon={Search}
      />

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Pinned Searches */}
        {pinnedSearches.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                <CardTitle>Pinned Searches</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              {pinnedSearches.map(search => (
                <SearchCard
                  key={search.id}
                  search={search}
                  onDelete={() => deleteMutation.mutate(search.id)}
                />
              ))}
            </CardContent>
          </Card>
        )}

        {/* All Searches */}
        <Card>
          <CardHeader>
            <CardTitle>All Saved Searches</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {regularSearches.map(search => (
              <SearchCard
                key={search.id}
                search={search}
                onDelete={() => deleteMutation.mutate(search.id)}
              />
            ))}

            {searches.length === 0 && (
              <div className="py-12 text-center">
                <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No saved searches yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SearchCard({ search, onDelete }) {
  return (
    <div className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-slate-900">{search.search_name}</h3>
            <Badge variant="outline">{search.entity_type}</Badge>
            {search.is_shared && (
              <Badge className="bg-blue-100 text-blue-700">Shared</Badge>
            )}
          </div>
          <p className="text-sm text-slate-600 mb-2">
            {Object.keys(search.filters || {}).length} filters applied
          </p>
          <div className="flex gap-4 text-xs text-slate-500">
            <span>Used {search.use_count || 0} times</span>
            {search.last_used_at && (
              <span>Last used {new Date(search.last_used_at).toLocaleDateString()}</span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Play className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={onDelete}>
            <Trash2 className="w-4 h-4 text-red-600" />
          </Button>
        </div>
      </div>
    </div>
  );
}