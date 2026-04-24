import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = window.ENV.SUPABASE_URL;
const supabaseKey = window.ENV.SUPABASE_ANON_KEY;

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
