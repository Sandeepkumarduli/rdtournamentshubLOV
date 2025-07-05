import { supabase } from '@/integrations/supabase/client';

export const useOrgRegistrations = () => {
  // Function to create org registration entries when a team registers for a tournament
  const createOrgRegistrationsForTeam = async (teamId: string, tournamentId: string) => {
    try {
      // Get tournament details to get the organization
      const { data: tournament } = await supabase
        .from('tournaments')
        .select('id, name, organization')
        .eq('id', tournamentId)
        .single();

      if (!tournament || !tournament.organization) {
        console.error('Tournament or organization not found');
        return { error: 'Tournament or organization not found' };
      }

      // Get all team members
      const { data: teamMembers } = await supabase
        .from('team_members')
        .select(`
          user_id,
          profiles!inner(
            user_id,
            display_name,
            email
          )
        `)
        .eq('team_id', teamId);

      if (!teamMembers || teamMembers.length === 0) {
        console.error('No team members found');
        return { error: 'No team members found' };
      }

      // Create org registration entries for each team member
      const orgRegistrations = teamMembers.map(member => ({
        user_id: member.user_id,
        username: member.profiles.display_name || member.profiles.email || 'Unknown',
        team_id: teamId,
        org_name: tournament.organization,
        tournament_id: tournamentId,
        registration_type: 'team'
      }));

      const { error } = await supabase
        .from('org_user_registrations')
        .insert(orgRegistrations);

      if (error) {
        console.error('Error creating org registrations:', error);
        return { error: 'Failed to create org registrations' };
      }

      console.log('Successfully created org registrations for team:', teamId);
      return { success: true };
    } catch (error) {
      console.error('Error in createOrgRegistrationsForTeam:', error);
      return { error: 'Failed to process org registrations' };
    }
  };

  // Function to create org registration for solo tournaments
  const createOrgRegistrationForUser = async (userId: string, tournamentId: string) => {
    try {
      // Get tournament details
      const { data: tournament } = await supabase
        .from('tournaments')
        .select('id, name, organization')
        .eq('id', tournamentId)
        .single();

      if (!tournament || !tournament.organization) {
        console.error('Tournament or organization not found');
        return { error: 'Tournament or organization not found' };
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id, display_name, email')
        .eq('user_id', userId)
        .single();

      if (!profile) {
        console.error('User profile not found');
        return { error: 'User profile not found' };
      }

      // Create org registration entry
      const orgRegistration = {
        user_id: userId,
        username: profile.display_name || profile.email || 'Unknown',
        team_id: null,
        org_name: tournament.organization,
        tournament_id: tournamentId,
        registration_type: 'solo'
      };

      const { error } = await supabase
        .from('org_user_registrations')
        .insert([orgRegistration]);

      if (error) {
        console.error('Error creating org registration:', error);
        return { error: 'Failed to create org registration' };
      }

      console.log('Successfully created org registration for user:', userId);
      return { success: true };
    } catch (error) {
      console.error('Error in createOrgRegistrationForUser:', error);
      return { error: 'Failed to process org registration' };
    }
  };

  // Function to populate existing registrations (migration helper)
  const populateExistingRegistrations = async () => {
    try {
      console.log('Starting to populate existing registrations...');
      
      // Get all tournament registrations with tournament and team data
      const { data: registrations } = await supabase
        .from('tournament_registrations')
        .select(`
          id,
          team_id,
          tournament_id,
          tournaments (
            id,
            name,
            organization
          ),
          teams (
            id,
            name
          )
        `);

      if (!registrations || registrations.length === 0) {
        console.log('No existing registrations found');
        return { success: true };
      }

      console.log('Found registrations to populate:', registrations.length);

      for (const registration of registrations) {
        if (!registration.tournaments?.organization) {
          console.log('Skipping registration without org:', registration.id);
          continue;
        }

        // Check if org registration already exists
        const { data: existingOrgReg } = await supabase
          .from('org_user_registrations')
          .select('id')
          .eq('tournament_id', registration.tournament_id)
          .eq('team_id', registration.team_id);

        if (existingOrgReg && existingOrgReg.length > 0) {
          console.log('Org registration already exists for:', registration.id);
          continue;
        }

        // Create org registrations for this team
        const result = await createOrgRegistrationsForTeam(
          registration.team_id,
          registration.tournament_id
        );

        if (result.error) {
          console.error('Failed to create org registration for:', registration.id, result.error);
        } else {
          console.log('Created org registrations for:', registration.id);
        }

        // Add small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      console.log('Finished populating existing registrations');
      return { success: true };
    } catch (error) {
      console.error('Error populating existing registrations:', error);
      return { error: 'Failed to populate existing registrations' };
    }
  };

  return {
    createOrgRegistrationsForTeam,
    createOrgRegistrationForUser,
    populateExistingRegistrations,
  };
};