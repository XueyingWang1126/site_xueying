/**
 * Home route controller.
 * Serves the main Thymeleaf index page.
 */
package com.xueying.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    @GetMapping("/")
    public String index() {
        return "index";
    }
}
