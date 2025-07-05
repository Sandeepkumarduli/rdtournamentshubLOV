import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useOrgRegistrations } from '@/hooks/useOrgRegistrations';
import { Loader2 } from 'lucide-react';

const PopulateRegistrationsButton = () => {
  const [isPopulating, setIsPopulating] = useState(false);
  const { toast } = useToast();
  const { populateExistingRegistrations } = useOrgRegistrations();

  const handlePopulate = async () => {
    setIsPopulating(true);
    try {
      const result = await populateExistingRegistrations();
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Successfully populated existing registrations for org dashboards",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to populate registrations",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to populate registrations",
        variant: "destructive"
      });
    } finally {
      setIsPopulating(false);
    }
  };

  return (
    <Button
      onClick={handlePopulate}
      disabled={isPopulating}
      variant="outline"
      className="mb-4"
    >
      {isPopulating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isPopulating ? 'Populating...' : 'Populate Existing Registrations'}
    </Button>
  );
};

export default PopulateRegistrationsButton;