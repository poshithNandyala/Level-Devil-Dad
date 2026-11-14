package com.poshith.leveldevildad.test;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.graphics.Rect;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Vibrator;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.RenderProcessGoneDetail;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

/**
 * Lightweight Android test build: one full-screen landscape WebView that serves the
 * bundled single-file game from a secure in-app origin (no network needed).
 * The production app is the Capacitor project in ../android.
 */
public class MainActivity extends Activity {
    static final String HOST = "appassets.androidplatform.net";
    private WebView web;

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        Window win = getWindow();
        win.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON | WindowManager.LayoutParams.FLAG_FULLSCREEN);
        WebView.setWebContentsDebuggingEnabled(true); // test build: inspect via chrome://inspect
        web = new WebView(this);
        web.setBackgroundColor(0xFF120F1C);
        web.setOverScrollMode(View.OVER_SCROLL_NEVER);
        web.setVerticalScrollBarEnabled(false);
        web.setHorizontalScrollBarEnabled(false);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setTextZoom(100);
        s.setSupportZoom(false);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        web.addJavascriptInterface(new Bridge(this), "AndroidHost");
        web.setWebChromeClient(new WebChromeClient());
        web.setWebViewClient(new AssetClient(this));
        web.loadUrl("https://" + HOST + "/index.html");
        setContentView(web);
        web.addOnLayoutChangeListener(new View.OnLayoutChangeListener() {
            @Override
            public void onLayoutChange(View v, int l, int t, int r, int b, int ol, int ot, int or, int ob) {
                keepEdgesForThumbs(v);
            }
        });
        hideBars();
    }

    /** Gesture navigation: stop back-swipes from the lower screen edges stealing the move/jump thumbs. */
    static void keepEdgesForThumbs(View v) {
        if (Build.VERSION.SDK_INT < 29) return;
        try {
            int w = v.getWidth(), h = v.getHeight();
            if (w == 0 || h == 0) return;
            float dp = v.getResources().getDisplayMetrics().density;
            int band = Math.min(h, (int) (200 * dp)); // the system honours up to 200dp per edge
            int edge = (int) (40 * dp);
            List<Rect> rects = new ArrayList<Rect>();
            rects.add(new Rect(0, h - band, edge, h));
            rects.add(new Rect(w - edge, h - band, w, h));
            v.setSystemGestureExclusionRects(rects);
        } catch (Throwable ignored) {
        }
    }

    @SuppressWarnings("deprecation")
    void hideBars() {
        getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                        | View.SYSTEM_UI_FLAG_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) hideBars();
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (web != null) web.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (web != null) web.onResume();
        hideBars();
    }

    @Override
    protected void onDestroy() {
        if (web != null) {
            web.destroy();
            web = null;
        }
        super.onDestroy();
    }

    @Override
    @SuppressWarnings("deprecation")
    public void onBackPressed() {
        // Let the game decide: close a menu, pause, or ask the host to exit from the title screen.
        if (web == null) {
            super.onBackPressed();
            return;
        }
        web.evaluateJavascript(
                "(function(){try{if(window.__ldd){window.__ldd.back();return 1}}catch(e){return 1}return 0})()",
                new ValueCallback<String>() {
                    @Override
                    public void onReceiveValue(String handled) {
                        if (!"1".equals(handled)) finish();
                    }
                });
    }

    /** window.AndroidHost in the page. */
    static final class Bridge {
        private final Activity act;

        Bridge(Activity act) {
            this.act = act;
        }

        @JavascriptInterface
        @SuppressWarnings("deprecation")
        public void vibrate(int ms) {
            try {
                Vibrator v = (Vibrator) act.getSystemService(Context.VIBRATOR_SERVICE);
                if (v != null && v.hasVibrator()) v.vibrate((long) Math.max(1, Math.min(ms, 200)));
            } catch (Throwable ignored) {
            }
        }

        @JavascriptInterface
        public void share(final String text) {
            act.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    try {
                        Intent send = new Intent(Intent.ACTION_SEND);
                        send.setType("text/plain");
                        send.putExtra(Intent.EXTRA_TEXT, text);
                        act.startActivity(Intent.createChooser(send, "Challenge a friend"));
                    } catch (Throwable ignored) {
                    }
                }
            });
        }

        @JavascriptInterface
        public void exit() {
            act.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    act.finish();
                }
            });
        }

        @JavascriptInterface
        public String version() {
            return "android-test-2";
        }
    }

    /** Serves assets/index.html at https://appassets.androidplatform.net/index.html. */
    static final class AssetClient extends WebViewClient {
        private final Activity act;

        AssetClient(Activity act) {
            this.act = act;
        }

        @Override
        public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
            Uri url = request.getUrl();
            if (!HOST.equals(url.getHost())) return null;
            String path = url.getPath();
            if ("/".equals(path) || "/index.html".equals(path)) {
                try {
                    InputStream in = act.getAssets().open("index.html");
                    return new WebResourceResponse("text/html", "utf-8", in);
                } catch (IOException e) {
                    return null;
                }
            }
            // nothing else is bundled; never reach out to the network
            return new WebResourceResponse("text/plain", "utf-8", null);
        }

        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
            Uri url = request.getUrl();
            if (HOST.equals(url.getHost())) return false;
            try {
                act.startActivity(new Intent(Intent.ACTION_VIEW, url));
            } catch (Throwable ignored) {
            }
            return true;
        }

        @Override
        public boolean onRenderProcessGone(WebView view, RenderProcessGoneDetail detail) {
            // the page's renderer died (low memory): rebuild instead of crashing the app
            act.recreate();
            return true;
        }
    }
}
