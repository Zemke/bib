package io.zemke.github.bib.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

@Entity
public class Book implements Comparable<Book> {

    @Id
    private String id;

    private String name;

    private String author;

    private Boolean avail;

    @Lob
    private String html;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "book_id")
    private List<Avail> avails;

    private LocalDateTime created;

    private LocalDateTime updated;

    public Book() {
        this.created = LocalDateTime.now();
        this.updated = this.created;
    }

    public Book(String id) {
        this();
        this.id = id;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public Book setName(String name) {
        this.name = name;
        return this;
    }

    public String getAuthor() {
        return author;
    }

    public Book setAuthor(String author) {
        this.author = author;
        return this;
    }

    public Boolean getAvail() {
        return avail;
    }

    public Book setAvail(Boolean avail) {
        this.avail = avail;
        return this;
    }

    public String getHtml() {
        return html;
    }

    public Book setHtml(String html) {
        this.html = html;
        return this;
    }

    public List<Avail> getAvails() {
        return avails;
    }

    public Book setAvails(List<Avail> avails) {
        this.avails = avails;
        return this;
    }

    public LocalDateTime getCreated() {
        return created;
    }

    public LocalDateTime getUpdated() {
        return updated;
    }

    public void setUpdated(LocalDateTime updated) {
        this.updated = updated;
    }

    @Override
    public String toString() {
        return "Book{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", author='" + author + '\'' +
                ", avail=" + avail +
                ", html='" + html + '\'' +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Book book = (Book) o;
        return Objects.equals(id, book.id);
    }

    @Override
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }

    @Override
    public int compareTo(Book o) {
        return Comparator
                .comparing(Book::getAuthor, Comparator.nullsFirst(String::compareTo))
                .thenComparing(Book::getName, Comparator.nullsFirst(String::compareTo))
                .compare(this, o);
    }
}
