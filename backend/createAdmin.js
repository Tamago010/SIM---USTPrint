const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const prompt = (question) =>
    new Promise((resolve) => rl.question(question, resolve));

async function createAdmin() {
    try {
        const email = await prompt('Enter admin email (e.g., admin@example.com): ');
        const password = await prompt('Enter admin password: ');
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { role: 'admin', isAdmin: true } },
        });
        if (error) throw error;

        await supabase.from('users').upsert([{ id: data.user.id, isAdmin: true }], { onConflict: 'id' });

        console.log(`Admin signup initiated for ${email}. User ID: ${data.user.id}`);
        if (!data.user.confirmed_at && data.user.confirmation_sent_at) {
            console.log('Please check your email to confirm the account.');
        }
        rl.close();
    } catch (err) {
        console.error('Error creating admin:', err.message);
        rl.close();
    }
}

createAdmin();