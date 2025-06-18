@@ .. @@
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     setError('');
     
     if (!displayName.trim() || !email.trim() || !password.trim()) {
       setError('Please fill in all fields');
       return;
     }
 
+    // Basic email validation
+    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
+    if (!emailRegex.test(email.trim())) {
+      setError('Please enter a valid email address');
+      return;
+    }
+
+    // Password validation
+    if (password.length < 6) {
+      setError('Password must be at least 6 characters long');
+      return;
+    }
+
     try {
       await register(displayName, email, password);
     } catch (err) {
       const message = err instanceof Error ? err.message : 'Registration failed. Please try again.';
       setError(message);
     }
   };