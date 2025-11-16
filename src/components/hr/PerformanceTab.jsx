import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, TrendingUp, User, Calendar, Star } from "lucide-react";
import AddPerformanceModal from "./AddPerformanceModal";

export default function PerformanceTab() {
  const [showAddModal, setShowAddModal] = useState(false);

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.PerformanceReview.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performanceReviews'] });
      setShowAddModal(false);
    },
  });
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['performanceReviews'],
    queryFn: () => base44.entities.PerformanceReview.list('-review_date', 50),
    initialData: [],
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: () => base44.entities.Employee.list('-created_date', 100),
    initialData: [],
  });

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown';
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'bg-emerald-100 text-emerald-800';
    if (rating >= 3.5) return 'bg-blue-100 text-blue-800';
    if (rating >= 2.5) return 'bg-amber-100 text-amber-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-xl bg-white">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Performance Reviews</h2>
              <p className="text-slate-600 mt-1">Track employee performance and development</p>
            </div>
            <Button onClick={() => setShowAddModal(true)} className="bg-gradient-to-r from-pink-600 to-rose-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Review
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
        </div>
      ) : reviews.length === 0 ? (
        <Card className="border-0 shadow-xl bg-white">
          <CardContent className="p-12 text-center">
            <TrendingUp className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No performance reviews</h3>
            <p className="text-slate-600">Start conducting performance reviews</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id} className="border-0 shadow-xl bg-white hover:shadow-2xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 bg-gradient-to-br from-pink-600 to-rose-600 rounded-xl">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg">
                          {getEmployeeName(review.employee_id)}
                        </h3>
                        <p className="text-sm text-slate-600">{review.review_period}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      {review.review_date && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span>{new Date(review.review_date).toLocaleDateString()}</span>
                        </div>
                      )}

                      {review.reviewer_user_id && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <User className="w-4 h-4 text-slate-400" />
                          <span>Reviewer ID: {review.reviewer_user_id}</span>
                        </div>
                      )}

                      {review.overall_rating && (
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-amber-500" />
                          <Badge className={getRatingColor(review.overall_rating)}>
                            {review.overall_rating.toFixed(1)} / 5.0
                          </Badge>
                        </div>
                      )}
                    </div>

                    {review.summary && (
                      <p className="text-sm text-slate-600 mt-3 line-clamp-2">
                        {review.summary}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddPerformanceModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={(data) => createMutation.mutate(data)}
        isLoading={createMutation.isPending}
        employees={employees}
      />
    </div>
  );
}