package com.towsif.youtube;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebViewClient;
import android.os.Bundle;
import android.webkit.WebView;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Run from native code: an old service worker can intercept index.html
        // before the newly packaged JavaScript gets a chance to clean it up.
        bridge.setWebViewClient(new BridgeWebViewClient(bridge) {
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                if (!url.startsWith("https://localhost/")) return;
                view.evaluateJavascript(
                    "(async()=>{if(!('serviceWorker' in navigator))return;"
                    + "const regs=await navigator.serviceWorker.getRegistrations();"
                    + "if(!regs.length)return;"
                    + "await Promise.all(regs.map(r=>r.unregister()));"
                    + "await Promise.all((await caches.keys()).map(k=>caches.delete(k)));"
                    + "location.reload();})().catch(e=>console.warn('Android cache cleanup failed',e));",
                    null
                );
            }
        });
    }
}
