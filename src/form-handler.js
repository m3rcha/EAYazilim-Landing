import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// TODO: Replace these with your actual Supabase project URL and anon key
const supabaseUrl = 'https://hjvalrqwshpxqzaabons.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqdmFscnF3c2hweHF6YWFib25zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5Njg3MjUsImV4cCI6MjA5MjU0NDcyNX0.AUUqJi8A-vvdv2Tf5km7Is0sKw4c3gsnWlzOfKv5Z-U';

const supabase = createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = 'Gönderiliyor...';
        submitBtn.disabled = true;

        const fullName = document.getElementById('full_name').value;
        const phone = document.getElementById('phone').value;
        const businessName = document.getElementById('business_name').value;
        const interestedPackage = document.getElementById('interested_package').value;

        try {
            const { data, error } = await supabase
                .from('contacts')
                .insert([
                    {
                        full_name: fullName,
                        phone: phone,
                        business_name: businessName,
                        interested_package: interestedPackage
                    }
                ]);

            if (error) throw error;

            alert('Mesajınız başarıyla gönderildi. En kısa sürede sizinle iletişime geçeceğiz.');
            form.reset();
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Bir hata oluştu. Lütfen daha sonra tekrar deneyin veya doğrudan telefonla ulaşın.');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
});
