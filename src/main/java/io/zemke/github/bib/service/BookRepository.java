package io.zemke.github.bib.service;

import io.zemke.github.bib.entity.Book;
import io.zemke.github.bib.entity.Bookworm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookRepository extends JpaRepository<Book, String> {

    List<Book> findByBookworm(Bookworm bookworm);
}
