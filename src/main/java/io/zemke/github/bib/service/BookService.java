package io.zemke.github.bib.service;

import io.zemke.github.bib.entity.Book;
import io.zemke.github.bib.http.Bibber;
import io.zemke.github.bib.http.DetailDto;
import io.zemke.github.bib.http.MetaDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

@Component
public class BookService {

    public static final LocalTime OPENING = LocalTime.of(9, 59);

    public static final LocalTime CLOSING = LocalTime.of(18, 1);

    private final Clock clock;

    private Bibber bibber;

    @Autowired
    public BookService(Bibber bibber) {
        this.clock = Clock.systemDefaultZone();
        this.bibber = bibber;
    }

    public BookService(Clock clock, Bibber bibber) {
        this.clock = clock;
        this.bibber = bibber;
    }

    public boolean shouldRefresh(Book book) {
        var btw = ChronoUnit.MINUTES.between(book.getUpdated(), LocalDateTime.now(clock));
        if (btw < 15) {
            return false;
        }
        if (LocalTime.now(clock).isAfter(OPENING) && LocalTime.now(clock).isBefore(CLOSING)) {
            // open now
            return true;
        }
        if (book.getUpdated().toLocalTime().isAfter(OPENING) && book.getUpdated().toLocalTime().isBefore(CLOSING)) {
            return true;
        }
        return btw >= (24 - CLOSING.getHour() + OPENING.getHour()) * 60;
    }

    public void refresh(Book book) {
        var res = asyncMetaDetail(book);
        book.getAvails().clear();
        book.getAvails().addAll(bibber.parseAvailHtml(res.meta.html()));
        book
                .setHtml(res.meta.html())
                .setAvail(res.meta.avail())
                .setName(res.detail.name())
                .setAuthor(res.detail.author());
        book.setUpdated(LocalDateTime.now());
    }

    private AsyncMetaDetailResult asyncMetaDetail(Book book) {
        var a = CompletableFuture.supplyAsync(() -> bibber.fetchMeta(book.getId()));
        var b = CompletableFuture.supplyAsync(() -> bibber.fetchDetail(book.getId()));
        try {
            CompletableFuture.allOf(a, b).get();
            return new AsyncMetaDetailResult(a.get(), b.get());
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException(e);
        }
    }

    private static class AsyncMetaDetailResult {

        public MetaDto meta;
        public DetailDto detail;

        public AsyncMetaDetailResult(MetaDto meta, DetailDto detail) {
            this.meta = meta;
            this.detail = detail;
        }
    }
}
