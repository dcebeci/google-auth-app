import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';

// Google tip tanımlamalarını eklemek için:
// npm install @types/google-one-tap --save-dev
declare var google: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  // Kendi Google Client ID'nizi buraya veya daha güvenli bir şekilde ortam değişkenlerine ekleyin.
  private GOOGLE_CLIENT_ID: string = ClientID; // <-- BURAYA KENDİ CLIENT ID'NİZİ GİRİNİZ

  constructor(private router: Router, private ngZone: NgZone) { }

  ngOnInit(): void {
    // Google One Tap / Sign In With Google başlatma
    google.accounts.id.initialize({
      client_id: this.GOOGLE_CLIENT_ID,
      callback: (response: any) => this.handleGoogleSignIn(response)
    });

    // Google One Tap'i göstermek için (opsiyonel, belirli bir HTML elementine bağlar)
    // google.accounts.id.renderButton(
    //   document.getElementById('google-button'), // HTML'de id="google-button" olan bir elementiniz olmalı
    //   { theme: 'outline', size: 'large' }
    // );

    // Otomatik One Tap prompt'unu göstermek için (opsiyonel, sayfa yüklendiğinde)
    // Eğer isterseniz, bu satırı aktif edebilirsiniz.
    // google.accounts.id.prompt();
  }

  signInWithGoogle(): void {
    // Pop-up ile giriş akışı için
    // Bu, kullanıcının Google hesabını seçmesi için bir pop-up tetikler.
    // Eğer One Tap'i kullanıyorsanız bu butona ihtiyacınız olmayabilir.
    google.accounts.id.prompt((notification: any) => {
      if (notification.is}") {
        // Başarılı bir giriş akışı başlatıldı (kullanıcı etkileşimi bekleniyor)
        console.log('Google Sign-In prompt displayed.');
      } else if (notification.isNotDisplayed()) {
        console.warn('Google One Tap UI could not be displayed. Possibly blocked by browser or already dismissed.');
        // Alternatif bir giriş yöntemi sunulabilir.
      } else if (notification.isSkippedMoment()) {
        console.log('User skipped the One Tap moment.');
      }
    });
  }

  handleGoogleSignIn(response: any): void {
    // JWT token'ı doğrulamak için bir backend'e göndermeniz ÇOK ÖNEMLİDİR.
    // Bu örnek sadece frontend odaklı olduğu için, token'ı burada basitçe logluyoruz ve decode ediyoruz.
    // Gerçek bir uygulamada, bu token'ı backend'e gönderip orada doğrulamalı ve kullanıcı oturumunu yönetmelisiniz.
    console.log('Google Sign-In Response:', response);
    const idToken = response.credential;
    console.log('ID Token (JWT):', idToken);

    // JWT'yi decode etme (Sadece frontend'de doğrulama YAPMAYIN, backend'de doğrulayın!)
    try {
      const base64Url = idToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const decodedToken = JSON.parse(atob(base64));
      console.log('Decoded Token Payload:', decodedToken);

      // Kullanıcı bilgilerini (isim, e-posta, resim) saklayın
      // GEÇİCİ ÇÖZÜM: Gerçek uygulamada güvenli bir şekilde saklayın (örn: Backend'den gelen session/token)
      localStorage.setItem('googleUser', JSON.stringify({
        name: decodedToken.name,
        email: decodedToken.email,
        picture: decodedToken.picture,
        idToken: idToken // Tüm token'ı kaydetmek istemeyebilirsiniz
      }));

    } catch (e) {
      console.error('Error decoding JWT:', e);
    }

    // Başarılı giriş sonrası dashboard'a yönlendirme
    // NgZone kullanıyoruz çünkü Google callback'i Angular'ın dışında çalışabilir.
    this.ngZone.run(() => {
      this.router.navigate(['/dashboard']);
    });
  }
}