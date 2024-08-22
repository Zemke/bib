package io.zemke.github.bib.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.OneToMany;

import java.util.Set;

@Entity
public class Book {

    @Id
    private String id;

    private String name;

    private String author;

    private Boolean avail;

    @Lob
    private String html;

    @OneToMany
    private Set<Avail> avails;

    public Book() {
    }

    public Book(String id) {
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

    public Set<Avail> getAvails() {
        return avails;
    }

    public Book setAvails(Set<Avail> avails) {
        this.avails = avails;
        return this;
    }

    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Book book = (Book) o;
        return id.equals(book.id);
    }

    @Override
    public int hashCode() {
        return id.hashCode();
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
}
