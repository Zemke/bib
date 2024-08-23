package io.zemke.github.bib.service;

import io.zemke.github.bib.entity.Book;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;

@Component
public class BookService {

    public static final LocalTime OPENING = LocalTime.of(9, 59);

    public static final LocalTime CLOSING = LocalTime.of(18, 1);

    private final Clock clock;

    public BookService() {
        this.clock = Clock.systemDefaultZone();
    }

    public BookService(Clock clock) {
        this.clock = clock;
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
}
