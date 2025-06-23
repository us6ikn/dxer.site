 (function() {
     // Helper function: Julian Date calculation
     function calculateB53(year, month, day, hour, minute) {
         return (
             367 * year
             - Math.floor(7 * (year + Math.floor((month + 9) / 12)) / 4)
             + Math.floor(275 * month / 9)
             + day
             + (hour + minute / 60) / 24
             - 730531.5
         );
     }

     // Helper function: Local Sidereal Time in radians
     function calculateC54LSTradians(B53, longitudeDeg, hour, minute) {
         const B54 = (
             100.46
             + 0.985647 * B53
             + longitudeDeg
             + 1.00273790935 * 15 * (hour + minute / 60)
         ) % 360;
         return B54 * Math.PI / 180;
     }

     // Helper function: B74 calculation
     function calculateB74(B53) {
         const B55 = B53 / 36525;
         const C55 = B55 ** 2;
         const D55 = B55 ** 3;
         const raw = 125.045 - 1934.14 * B55 + 0.002071 * C55 + D55 / 450000;
         return raw % 360;
     }

     // Helper function: B78 calculation
     function calculateB78(B53) {
         const B55 = B53 / 36525;
         const C55 = B55 ** 2;
         const D55 = B55 ** 3;

         const B75 = (134.963 + 477199 * B55 + 0.008997 * C55 + D55 / 69700) % 360;
         const C75 = B75 * Math.PI / 180;

         const B76 = (297.85 + 445267 * B55 - 0.00163 * C55 + D55 / 545900) % 360;
         const B77 = 2 * B76;
         const C77 = B77 * Math.PI / 180;

         return 1 + (-20954 * Math.cos(C75) - 3699 * Math.cos(C77 - C75) - 2956 * Math.cos(C77)) / 385000;
     }

     // Helper function: C80 and B72 calculation
     function calculateC80andB72(B53) {
         const B55 = B53 / 36525;
         const C55 = B55 ** 2;
         const D55 = B55 ** 3;

         const B75 = (134.963 + 477199 * B55 + 0.008997 * C55 + D55 / 69700) % 360;
         const C75 = B75 * Math.PI / 180;

         const B76 = (297.85 + 445267 * B55 - 0.00163 * C55 + D55 / 545900) % 360;
         const B77 = 2 * B76;
         const C77 = B77 * Math.PI / 180;

         const B72 = (93.2721 + 483202 * B55 - 0.003403 * C55 - D55 / 3526000) % 360;
         const C72 = B72 * Math.PI / 180;

         const B80 = (
             5.128 * Math.sin(C72)
             + 0.2806 * Math.sin(C75 + C72)
             + 0.2777 * Math.sin(C75 - C72)
             + 0.1732 * Math.sin(C77 - C72)
         );

         return [B80 * Math.PI / 180, B72];
     }

     // Helper function: B82 calculation
     function calculateB82(B53) {
         const B55 = B53 / 36525;
         const C55 = B55 ** 2;
         const D55 = B55 ** 3;

         const B75 = (134.963 + 477199 * B55 + 0.008997 * C55 + D55 / 69700) % 360;
         const C75 = B75 * Math.PI / 180;

         const B76 = (297.85 + 445267 * B55 - 0.00163 * C55 + D55 / 545900) % 360;
         const B77 = 2 * B76;
         const C77 = B77 * Math.PI / 180;

         const B72 = (93.2721 + 483202 * B55 - 0.003403 * C55 - D55 / 3526000) % 360;
         const C72 = B72 * Math.PI / 180;

         const B59 = (357.529 + 35999 * B55 - 0.0001536 * C55 + D55 / 24490000) % 360;
         const C59 = B59 * Math.PI / 180;

         const B73 = (218.316 + 481268 * B55) % 360;

         const B81 = (
             6.289 * Math.sin(C75)
             + 1.274 * Math.sin(C77 - C75)
             + 0.6583 * Math.sin(C77)
             + 0.2136 * Math.sin(2 * C75)
             - 0.1851 * Math.sin(C59)
             - 0.1143 * Math.sin(2 * C72)
             + 0.0588 * Math.sin(C77 - 2 * C75)
             + 0.0572 * Math.sin(C77 - C59 - C75)
             + 0.0533 * Math.sin(C77 + C75)
         );

         return B73 + B81;
     }

     // Helper function: C85 calculation
     function calculateC85(B82, C80, C67) {
         const C82 = B82 * Math.PI / 180;
         const denominator = Math.cos(C82);
         const numerator = Math.sin(C82) * Math.cos(C67) - Math.tan(C80) * Math.sin(C67);
         return Math.atan2(numerator, denominator);
     }

     // Main function: Calculate topocentric libration
     function topocentricLibration(year, month, day, hour, minute, latitudeDeg, longitudeDeg) {
         const B53 = calculateB53(year, month, day, hour, minute);
         const C54 = calculateC54LSTradians(B53, longitudeDeg, hour, minute);
         const B74 = calculateB74(B53);
         const C74 = B74 * Math.PI / 180;
         const B78 = calculateB78(B53);
         const [C80, B72] = calculateC80andB72(B53);
         const B82 = calculateB82(B53);
         const C82 = B82 * Math.PI / 180;
         const B55 = B53 / 36525;
         const B67 = (84381.448 - 46.815 * B55) / 3600;
         const C67 = B67 * Math.PI / 180;
         let C85 = calculateC85(B82, C80, C67);
         const D85 = C85 >= 0 ? C85 : 2 * Math.PI + C85;
         const C86 = Math.asin(Math.sin(C80) * Math.cos(C67) + Math.cos(C80) * Math.sin(C67) * Math.sin(C82));
         const B90 = 1.54242;
         const B91 = (B82 - B74) % 360;
         const C91 = B91 * Math.PI / 180;
         const C90 = B90 * Math.PI / 180;

         // Lo computation
         const B92 = Math.sin(C91) * Math.cos(C80) * Math.cos(C90) - Math.sin(C80) * Math.sin(C90);
         const B93 = Math.cos(C91) * Math.cos(C80);
         const C94 = Math.atan2(B92, B93);
         const B94 = (C94 * 180 / Math.PI) % 360;
         const Lo = B94 - B72;

         // Bo computation
         const B96 = -Math.sin(C91) * Math.cos(C80) * Math.sin(C90) - Math.sin(C80) * Math.cos(C90);
         const C97 = Math.asin(B96);
         const Bo = C97 * 180 / Math.PI;

         const C11 = longitudeDeg * Math.PI / 180;
         const C12 = latitudeDeg * Math.PI / 180;

         const C121 = C54 - D85;

         const B127 = Math.sin(C90) * Math.sin(C74);
         const B128 = Math.sin(C90) * Math.cos(C74) * Math.cos(C67) - Math.cos(C90) * Math.sin(C67);

         let C129 = Math.atan2(B127, B128);
         if (C129 < 0) {
             C129 += 2 * Math.PI;
         }

         const sqrtExpr = Math.sqrt(B127 ** 2 + B128 ** 2);
         const C130 = Math.asin((sqrtExpr * Math.cos(C85 - C129)) / Math.cos(C97));

         let D134 = Math.atan2(
             Math.cos(C12) * Math.sin(C121),
             Math.cos(C86) * Math.sin(C12) - Math.sin(C86) * Math.cos(C12) * Math.cos(C121)
         );
         const C134 = D134 >= 0 ? D134 : (2 * Math.PI + D134);

         const C135 = Math.acos(
             Math.sin(C86) * Math.sin(C12) + Math.cos(C86) * Math.cos(C12) * Math.cos(C121)
         );

         const C136 = Math.asin(6378.14 / (385000 * B78));
         const B136 = C136 * 180 / Math.PI;

         const B137 = B136 * (Math.sin(C135) + 0.0084 * Math.sin(2 * C135));

         const B138 = -B137 * Math.sin(C134 - C130) / Math.cos(C97);
         const B139 = B137 * Math.cos(C134 - C130);

         const topolibLat = Bo + B139;
         const topolibLon = Lo + B138;

         return [topolibLat, topolibLon];
     }

     // Expose functions globally via AstroLib namespace
     window.AstroLib = {
         topocentricLibration,
         calculateB53,
         calculateC54LSTradians,
         calculateB74,
         calculateB78,
         calculateC80andB72,
         calculateB82,
         calculateC85
     };
 })();
