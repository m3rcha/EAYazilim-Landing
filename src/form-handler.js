import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = window.ENV.SUPABASE_URL;
const supabaseKey = window.ENV.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnContent = submitBtn.innerHTML;
    
    let messageEl = form.querySelector('.form-message');
    if (!messageEl) {
        messageEl = document.createElement('div');
        messageEl.className = 'form-message hidden';
        form.insertBefore(messageEl, form.firstChild);
    }

    function showMessage(type, text) {
        messageEl.className = `form-message ${type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'} rounded-xl px-5 py-4 text-sm font-medium mb-6 flex items-center gap-3`;
        const icon = type === 'success' 
            ? '<svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'
            : '<svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
        messageEl.innerHTML = icon + '<span>' + text + '</span>';
        messageEl.classList.remove('hidden');
        messageEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function hideMessage() {
        messageEl.classList.add('hidden');
        messageEl.innerHTML = '';
    }

    function setLoading(loading) {
        if (loading) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Gönderiliyor...';
        } else {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnContent;
        }
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideMessage();
        setLoading(true);

        const fullName = document.getElementById('full_name').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const businessName = document.getElementById('business_name').value.trim();
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

            showMessage('success', 'Mesajınız başarıyla gönderildi. En kısa sürede sizinle iletişime geçeceğiz.');
            form.reset();
        } catch (error) {
            console.error('Error submitting form:', error);
            showMessage('error', 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin veya doğrudan telefonla ulaşın.');
        } finally {
            setLoading(false);
        }
    });
});
