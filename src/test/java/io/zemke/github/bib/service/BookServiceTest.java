package io.zemke.github.bib.service;

import io.zemke.github.bib.entity.Book;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class BookServiceTest {

    @Test
    void shouldRefresh_10mAgoClosingHours() {
        var clock = getClock(8, 2, 0);
        var cut = new BookService(clock, null);
        var book = book(LocalDateTime.now(clock).minusMinutes(10));
        assertThat(cut.shouldRefresh(book)).isFalse();
    }

    @Test
    void shouldRefresh_10mAgoOpeningHours() {
        var clock = getClock(14, 13, 10);
        var cut = new BookService(clock, null);
        var book = book(LocalDateTime.now(clock).minusMinutes(10));
        assertThat(cut.shouldRefresh(book)).isFalse();
    }

    @Test
    void shouldRefresh_20mAgoClosingHours() {
        var clock = getClock(8, 2, 0);
        var cut = new BookService(clock, null);
        var book = book(LocalDateTime.now(clock).minusMinutes(20));
        assertThat(cut.shouldRefresh(book)).isFalse();
    }

    @Test
    void shouldRefresh_20mAgoOpeningHours() {
        var clock = getClock(14, 13, 10);
        var cut = new BookService(clock, null);
        var book = book(LocalDateTime.now(clock).minusMinutes(20));
        assertThat(cut.shouldRefresh(book)).isTrue();
    }

    @Test
    void shouldRefresh_longAgo() {
        var clock = getClock(14, 13, 10);
        var cut = new BookService(clock, null);
        var book = book(LocalDateTime.now(clock).minusDays(30));
        assertThat(cut.shouldRefresh(book)).isTrue();
    }

    @Test
    void shouldRefresh_24h() {
        var clock = getClock(14, 8, 0);
        var cut = new BookService(clock, null);
        for (var h = 24; h >= 14; h--) {
            var book = book(LocalDateTime.now(clock).minusHours(h));
            assertThat(cut.shouldRefresh(book)).isTrue();
        }
        for (var h = 13; h >= 1; h--) {
            var book = book(LocalDateTime.now(clock).minusHours(h));
            assertThat(cut.shouldRefresh(book)).isFalse();
        }
    }

    private Clock getClock(int dayOfMonth, int hour, int minute) {
        var now = ZonedDateTime.of(2024, 8, dayOfMonth, hour, minute, 0, 0, ZoneId.of("Europe/Berlin"));
        return Clock.fixed(now.toInstant(), now.getZone());
    }

    private Book book(LocalDateTime updated) {
        var book = new Book();
        book.setUpdated(updated);
        return book;
    }
}