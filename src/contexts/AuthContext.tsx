const register = async (displayName: string, email: string, password: string) => {
     try {
       const { error: signUpError, data } = await supabase.auth.signUp({
         email: email.trim(),
         password: password.trim(),
         options: {
           data: {
             display_name: displayName.trim()
           }
         }
       });
 
       if (signUpError) {
         toast.error(signUpError.message);
         return;
       }
 
       if (!data?.user) {
         toast.error('Registration failed');
         return;
       }
 
      // Only create profile if user was successfully created
      if (data.user && !data.user.email_confirmed_at) {
        // For development, we'll create the profile immediately
        // In production, this would typically happen after email confirmation
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          display_name: displayName.trim(),
          email: email.trim()
        });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          // Don't throw here as the user account was created successfully
        }

        // Assign student role
        try {
          const { data: roleData } = await supabase.rpc('get_student_role').single<StudentRole>();

          if (roleData?.id) {
            const { error: roleError } = await supabase.from('user_roles').insert({
              user_id: data.user.id,
              role_id: roleData.id,
            });

            if (roleError) {
              console.error('Role assignment error:', roleError);
              // Don't throw here as the user account was created successfully
            }
          }
        } catch (roleErr) {
          console.error('Error getting student role:', roleErr);
        }
      }

      toast.success('Successfully registered! Please sign in.');
      navigate('/login');
    } catch {
      toast.error('Error during registration');
    }
  };