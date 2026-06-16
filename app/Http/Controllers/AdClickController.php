<?php

namespace App\Http\Controllers;

use App\Models\Advertisement;

class AdClickController extends Controller
{
    /** Record a click and redirect to the ad's (sanitized) target. */
    public function __invoke(Advertisement $advertisement)
    {
        $target = $advertisement->safeRedirectUrl();

        if (! $target) {
            return redirect()->route('home');
        }

        $advertisement->recordClick();

        // External targets open via a plain redirect; internal paths stay on-site.
        return redirect()->away($target);
    }
}
