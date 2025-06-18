
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface NotificationFiltersProps {
  filter: string;
  setFilter: (filter: string) => void;
}

export const NotificationFilters = ({ filter, setFilter }: NotificationFiltersProps) => {
  const filterOptions = [
    { id: "all", label: "All" },
    { id: "unread", label: "Unread" },
    { id: "high-priority", label: "High Priority" },
    { id: "deadlines", label: "Deadlines" }
  ];

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex space-x-2">
          {filterOptions.map((filterOption) => (
            <Button
              key={filterOption.id}
              variant={filter === filterOption.id ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(filterOption.id)}
            >
              {filterOption.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
