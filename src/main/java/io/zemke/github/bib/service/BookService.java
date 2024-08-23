package io.zemke.github.bib.service;

import io.zemke.github.bib.entity.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;

import java.time.*;
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
        if (ChronoUnit.MINUTES.between(book.getUpdated() ,LocalDateTime.now(clock)) < 15) {
            return false;
        }
        if (book.getUpdated().toLocalTime().isAfter(OPENING)
                && book.getUpdated().toLocalTime().isBefore(CLOSING)) {
            return true;
        } else if (LocalTime.now(clock).isAfter(OPENING) && LocalTime.now(clock).isBefore(CLOSING)
                && LocalDate.now(clock).getDayOfWeek() != DayOfWeek.SUNDAY) {
            return true;
        }
        return false;
    }
}
