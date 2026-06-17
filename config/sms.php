<?php

return [
    // Send on a queue when true; false = send inline (cPanel-safe, no worker needed).
    'queue' => env('SMS_QUEUE', false),
];
