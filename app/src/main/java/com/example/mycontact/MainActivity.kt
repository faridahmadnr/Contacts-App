package com.example.mycontact

import android.os.Bundle
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.mycontact.data.AppDatabase
import com.example.mycontact.data.Contact
import com.example.mycontact.databinding.ActivityMainBinding
import com.example.mycontact.databinding.FormContactBinding
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding

    private lateinit var contactViewAdapter: ContactViewAdapter

    private val contactDao by lazy { AppDatabase.get(this).contactDao() }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        contactViewAdapter = ContactViewAdapter(
            onEdit = { }
            onDelete = { }
        )

        with(binding) {
            rvContact.apply {
                adapter = contactViewAdapter
                layoutManager = LinearLayoutManager(this@MainActivity)
            }

            btnAdd.setOnClickListener {
                showAddDialog()

            }
        }
    }

    override fun onResume() {
        super.onResume()
        refreshList()
    }

    fun refreshList() {
        lifecycleScope.launch {
            var items = withContext(Dispatchers.IO) { contactDao.getAll() }
            contactViewAdapter.setItems(items)
        }
    }

    private fun showAddDialog() {
        var binding = FormContactBinding.inflate(layoutInflater)
        var builder = AlertDialog.Builder(this@MainActivity)
        builder.setTitle("Add Contact")
        builder.setView(binding.root)

        builder.setPositiveButton("Save") { dialog, which ->
            var name = binding.edtName.text.toString().trim()
            var phone = binding.edtPhone.text.toString().trim()

            if (name.isNotEmpty() && phone.isNotEmpty()) {
                lifecycleScope.launch(Dispatchers.IO) {
                    contactDao.insert(Contact(name = name, phone = phone))
                    withContext(Dispatchers.Main) { refreshList() }
                }
            } else {
                Toast.makeText(
                    this@MainActivity,
                    "Nama dan Nomor Telepon harus diisi",
                    Toast.LENGTH_SHORT
                ).show()
            }
        }
        builder.setNeutralButton("Cancel") { dialog, which ->
            dialog.dismiss()
        }

        val dialog = builder.create()
        builder.show()
    }

    private fun showEditDialog(contact: Contact){

    }
}