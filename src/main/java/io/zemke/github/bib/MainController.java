package io.zemke.github.bib;

import io.zemke.github.bib.entity.Avail;
import io.zemke.github.bib.entity.Book;
import io.zemke.github.bib.http.Bibber;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.net.MalformedURLException;
import java.net.URL;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Controller
public class MainController {

    public static final LocalTime OPENING = LocalTime.of(9, 59);
    public static final LocalTime CLOSING = LocalTime.of(18, 1);
    private BookRepository bookRepository;
    private Bibber bibber;

    @Autowired
    public MainController(BookRepository bookRepository, Bibber bibber) {
        this.bookRepository = bookRepository;
        this.bibber = bibber;
    }

    @GetMapping("/")
    public String index(Model model) {
        model.addAttribute("idOrLink", "");
        List<Book> books = bookRepository.findAll();
        for (Book book : books) {
            if (ChronoUnit.MINUTES.between(LocalDateTime.now(), book.getUpdated()) < 15) {
                continue;
            }
            if (book.getUpdated().toLocalTime().isAfter(OPENING)
                    && book.getUpdated().toLocalTime().isBefore(CLOSING)) {
                refresh(book);
            } else if (LocalTime.now().isAfter(OPENING) && LocalTime.now().isBefore(CLOSING)
                    && LocalDate.now().getDayOfWeek() != DayOfWeek.SUNDAY) {
                refresh(book);
            }
        }
        Map<String, Map<String, List<Avail>>> booksToBooksByLoc = books.stream()
                .collect(Collectors.toMap(Book::getId, b ->
                        b.getAvails().stream()
                                .sorted()
                                .collect(Collectors.groupingBy(Avail::getLoc, LinkedHashMap::new, Collectors.toList()))
                ));
        model.addAttribute("avails", booksToBooksByLoc);
        model.addAttribute("books", books);
        return "index.html";
    }

    @PostMapping("/")
    public String index(@RequestParam String idOrLink, Model model) {
        String id;
        if (idOrLink.contains("http") || idOrLink.contains(".de") || idOrLink.contains("www") || idOrLink.contains("stadt")) {
            // link
            List<String> qq;
            try {
                qq = Arrays.asList(new URL(idOrLink).getQuery().split("="));
            } catch (MalformedURLException e) {
                throw new RuntimeException(e);
            }
            int idxId = qq.indexOf("id");
            if (qq.size() < 2 || idxId < 0) {
                return index(model);
            }
            id = qq.get(idxId + 1);
        } else {
            id = idOrLink;
        }

        if (bookRepository.findById(id).isPresent()) {
            return index(model);
        }

        refresh(new Book(id));
        return index(model);
    }

    private void refresh(Book book) {
        var meta = bibber.fetchMeta(book.getId());
        var detail = bibber.fetchDetail(book.getId());
        book
                .setHtml(meta.html())
                .setAvail(meta.avail())
                .setName(detail.name())
                .setAuthor(detail.author())
                .setAvails(bibber.parseAvailHtml(meta.html()));
        if (!book.getCreated().isEqual(book.getUpdated())) {
            book.setUpdated(LocalDateTime.now());
        }
        bookRepository.save(book);
    }

    @PostMapping("/{id}")
    public String delete(@RequestParam String method, @PathVariable String id) {
        if ("delete".equals(method)) {
            var b = bookRepository.findById(id).orElseThrow();
            bookRepository.delete(b);
        }
        return "redirect:/";
    }
}

