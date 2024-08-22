package io.zemke.github.bib.http;

import org.json.JSONObject;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Component
@Profile("prod")
public class BibberLiveImpl implements Bibber {

    public static final String CHECK = "https://open.stadt-muenster.de/DesktopModules/OCLC.OPEN.PL.DNN.SearchModule/SearchService.asmx/GetAvailability";

    @Override
    public MetaDto fetchMeta(String id) {
        try {
            var body = "{'portalId':0,'mednr':'" + id + "','culture':'de-DE','branchFilter':'','requestCopyData':true}";
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(CHECK))
                    .header("Content-Type", "application/json;charset=utf-8")
                    .header("Accept", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();
            HttpResponse<String> response = HttpClient.newHttpClient().send(request,
                    HttpResponse.BodyHandlers.ofString());
            var J = new JSONObject(response.body()).getJSONObject("d");
            var avail = J.getBoolean("IsAvail");
            var html = J.getString("CopyData")
                    .replaceAll("\\r\\n", "")
                    .replaceAll("\\t", "");
            return new MetaDto(avail, html);
        } catch (Throwable e) {
            throw new BibberException(e);
        }
    }

    @Override
    public DetailDto fetchDetail(String id) {
        try {
            var requestDetail = HttpRequest.newBuilder()
                    .uri(URI.create("https://open.stadt-muenster.de/?id=" + id))
                    .header("Content-Type", "text/html,application/xhtml+xml,application/xml")
                    .GET()
                    .build();
            HttpResponse<String> responseDetailHtml = HttpClient.newHttpClient().send(requestDetail,
                    HttpResponse.BodyHandlers.ofString());
            Document parsed = Jsoup.parse(responseDetailHtml.body());
            return new DetailDto(
                    parsed.getElementById("bibtip_hst").text(),
                    parsed.getElementById("bibtip_author").text()
            );
        } catch (Throwable e) {
            throw new BibberException(e);
        }
    }

    /**
     * Gateway error.
     */
    public static class BibberException extends RuntimeException {
        public BibberException(Throwable cause) {
            super(cause);
        }
    }
}
