<?php

namespace Tests\Feature;

use Tests\TestCase;

class RenewalInvoicePreviewTest extends TestCase
{
    public function test_invoice_preview_renders_all_required_data(): void
    {
        $response = $this->get('/renewal-invoice');

        $response->assertOk()
            ->assertViewHas('renewal')
            ->assertViewHas('generatedAt')
            ->assertSee('INV-DEMO-001')
            ->assertSee('PT Klien Demo')
            ->assertSee('Website Klien Demo')
            ->assertSee('contoh.id')
            ->assertSee('Domain')
            ->assertSee('Provider Demo')
            ->assertSee('Menunggu Pembayaran')
            ->assertSee('Rp 250.000')
            ->assertSee('Contoh invoice perpanjangan untuk keperluan demo.')
            ->assertSee('Admin Demo');
    }
}
