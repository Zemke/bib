package io.zemke.github.bib.http;

import io.zemke.github.bib.entity.Avail;
import org.jsoup.Jsoup;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

public interface Bibber {
    MetaDto fetchMeta(String id);

    DetailDto fetchDetail(String id);

    default List<Avail> parseAvailHtml(String html) {
        return Jsoup.parse(html).getElementsByTag("table")
                .get(0)
                .getElementsByTag("tr").stream()
                .skip(1)
                .map(tr -> {
                    var tds = tr.getElementsByTag("td");
                    var avail = new Avail();
                    avail.setLoc(tds.get(0).getElementsByTag("span").get(1).text());
                    avail.setPos(tds.get(2).getElementsByTag("span").get(1).text());
                    String rent = tds.get(4).getElementsByTag("span").get(1).text();
                    if (rent.isEmpty()) {
                        avail.setRent(null);
                    } else {
                        avail.setRent(LocalDate.parse(rent, DateTimeFormatter.ofPattern("dd.MM.uuuu", Locale.GERMAN)));
                    }
                    avail.setPre(Integer.parseInt(tds.get(5).getElementsByTag("span").get(1).text()));
                    return avail;
                })
                .collect(Collectors.toList());
    }
}
