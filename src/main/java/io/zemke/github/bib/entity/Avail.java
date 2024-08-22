package io.zemke.github.bib.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.Objects;

@Entity
public class Avail implements Comparable<Avail> {

    public static final String HAUPTSTELLE = "Hauptstelle";
    @Id
    @GeneratedValue
    private Long id;

    private String loc;

    private String pos;

    private String status;

    private LocalDate rent;

    private int pre;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getLoc() {
        return loc;
    }

    public void setLoc(String loc) {
        this.loc = loc;
    }

    public String getPos() {
        return pos;
    }

    public void setPos(String pos) {
        this.pos = pos;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getStatus() {
        return status;
    }

    public LocalDate getRent() {
        return rent;
    }

    public void setRent(LocalDate rent) {
        this.rent = rent;
    }

    public int getPre() {
        return pre;
    }

    public void setPre(int pre) {
        this.pre = pre;
    }

    @Override
    public String toString() {
        return "Avail{" +
                "id=" + id +
                ", loc='" + loc + '\'' +
                ", pos='" + pos + '\'' +
                ", status='" + status + '\'' +
                ", rent=" + rent +
                ", pre=" + pre +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Avail avail = (Avail) o;
        return Objects.equals(id, avail.id);
    }

    @Override
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }

    @Override
    public int compareTo(Avail o) {
        return Comparator
                .comparing(Avail::getLoc, (o1, o2) -> {
                    if (o1.equals(HAUPTSTELLE)) {
                        return -1;
                    } else if (o2.equals(HAUPTSTELLE)) {
                        return 1;
                    }
                    return Comparator.nullsFirst(String::compareTo).compare(o1, o2);
                })
                .thenComparing(Avail::getRent, Comparator.nullsFirst(LocalDate::compareTo))
                .thenComparing(Avail::getPos, Comparator.nullsFirst(String::compareTo))
                .compare(this, o);
    }
}
