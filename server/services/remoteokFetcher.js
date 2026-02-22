// services/remoteokFetcher.js
// Fetches remote job listings from RemoteOK API and stores them in Supabase.
// Avoids duplicate inserts by checking if a job with the same title + company exists.
// Exports: fetchAndStoreRemoteJobs()

const supabase = require('./supabaseClient');

// RemoteOK public API endpoint
const REMOTEOK_API_URL = 'https://remoteok.com/api';

/**
 * Fetches jobs from RemoteOK and inserts new ones into the "opportunities" table.
 * Skips the first element (RemoteOK metadata) and avoids duplicates.
 */
async function fetchAndStoreRemoteJobs() {
    console.log('Fetching jobs from RemoteOK...');

    try {
        // 1. Fetch jobs from the RemoteOK API (Node v20 built-in fetch)
        const response = await fetch(REMOTEOK_API_URL, {
            headers: {
                'User-Agent': 'SkillSync/1.0', // RemoteOK requires a User-Agent header
            },
        });

        if (!response.ok) {
            throw new Error(`RemoteOK API error (${response.status}): ${response.statusText}`);
        }

        const data = await response.json();

        // 2. Skip the first element (it's metadata, not a job listing)
        const jobs = data.slice(1);
        console.log(`Found ${jobs.length} jobs from RemoteOK.`);

        let inserted = 0;
        let skipped = 0;

        // 3. Process each job
        for (const job of jobs) {
            const title = job.position || 'Untitled';
            const company = job.company || 'Unknown';

            // 4. Check for duplicates — skip if same title + company already exists
            const { data: existing, error: checkError } = await supabase
                .from('opportunities')
                .select('id')
                .eq('title', title)
                .eq('company', company)
                .limit(1);

            if (checkError) {
                console.error(`Error checking duplicate for "${title}":`, checkError.message);
                continue;
            }

            if (existing && existing.length > 0) {
                skipped++;
                continue; // Already exists, skip
            }

            // 5. Build the opportunity object
            const opportunity = {
                title,
                company,
                description: job.description || '',
                type: 'job',
                location: job.location || 'Remote',
                skills: Array.isArray(job.tags) ? job.tags.join(', ') : '',
                source: 'RemoteOK',
                apply_url: job.url || '',
            };

            // 6. Insert into Supabase
            const { error: insertError } = await supabase
                .from('opportunities')
                .insert([opportunity]);

            if (insertError) {
                console.error(`Error inserting "${title}":`, insertError.message);
            } else {
                inserted++;
            }
        }

        console.log(`Done! Inserted: ${inserted}, Skipped (duplicates): ${skipped}`);
        return { inserted, skipped };
    } catch (error) {
        console.error('RemoteOK fetch error:', error.message);
        throw error;
    }
}

module.exports = { fetchAndStoreRemoteJobs };
